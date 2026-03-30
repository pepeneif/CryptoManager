/**
 * Cashu Wallet Service
 * 
 * Maneja operaciones de wallet Cashu:
 * - Crear/recibir wallets
 * - Enviar/recibir pagos
 * - Gestión de invoices
 * - Historial con memos
 */

import { mnemonicToSeed, validateMnemonic as bip39Validate, generateMnemonic as bip39Generate } from 'bip39';
import { getDecodedToken, getEncodedToken } from '@cashu/cashu-ts';
import { secureStorage, type EncryptedWallet } from './secureStorage';

// Tipos locales
export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'melt' | 'mint';
  amount: number;
  memo?: string;
  counterparty?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  token?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  memo: string;
  payer?: string;
  bolt11?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  createdAt: number;
  paidAt?: number;
  expiresAt?: number;
  quoteId?: string;
}

export interface WalletState {
  id: string;
  name: string;
  balance: number;
  hasBalance: boolean;
  defaultMint: string;
  createdAt: number;
}

// Mints por defecto (prueba)
const DEFAULT_MINTS = [
  'https://testnut.cashu.space',
  'https://mint.minibits.cash',
];

// Storage local para transacciones (en IndexedDB)
const TX_DB_NAME = 'CryptoManagerTransactions';
const TX_STORE_NAME = 'transactions';
const INV_STORE_NAME = 'invoices';

export class CashuWalletService {
  private currentWallet: {
    id: string;
    mnemonic: string;
    seed?: Uint8Array;
  } | null = null;

  private transactions: Transaction[] = [];
  private invoices: Invoice[] = [];
  private balance: number = 0;
  private defaultMint: string = DEFAULT_MINTS[0];

  /**
   * Inicializar el servicio
   */
  async init(): Promise<void> {
    await secureStorage.init();
    await this.initTransactionDB();
  }

  /**
   * Inicializar IndexedDB para transacciones
   */
  private async initTransactionDB(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open(TX_DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(TX_STORE_NAME)) {
          const txStore = db.createObjectStore(TX_STORE_NAME, { keyPath: 'id' });
          txStore.createIndex('createdAt', 'createdAt', { unique: false });
          txStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains(INV_STORE_NAME)) {
          const invStore = db.createObjectStore(INV_STORE_NAME, { keyPath: 'id' });
          invStore.createIndex('status', 'status', { unique: false });
          invStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve();
    });
  }

  /**
   * Generar mnemonic de 12 palabras
   */
  generateMnemonic(): string {
    return bip39Generate(128); // 128 bits = 12 palabras
  }

  /**
   * Validar mnemonic
   */
  validateMnemonic(mnemonic: string): boolean {
    return bip39Validate(mnemonic);
  }

  /**
   * Crear nueva wallet
   */
  async createWallet(name: string, password: string, mnemonic?: string): Promise<string> {
    const id = crypto.randomUUID();
    const seedPhrase = mnemonic || this.generateMnemonic();

    if (!this.validateMnemonic(seedPhrase)) {
      throw new Error('Invalid mnemonic');
    }

    // Guardar encriptado
    await secureStorage.saveWallet(id, seedPhrase, password, name);

    // Derivar seed
    const seed = await mnemonicToSeed(seedPhrase);

    // Inicializar wallet en memoria
    this.currentWallet = { id, mnemonic: seedPhrase, seed };

    // Guardar estado inicial
    await this.saveState();

    return id;
  }

  /**
   * Desbloquear wallet existente
   */
  async unlockWallet(id: string, password: string): Promise<WalletState> {
    const encryptedWallet = await secureStorage.loadWallet(id);
    if (!encryptedWallet) {
      throw new Error('Wallet not found');
    }

    const mnemonic = await secureStorage.decryptMnemonic(encryptedWallet, password);
    const seed = await mnemonicToSeed(mnemonic);
    
    this.currentWallet = { id, mnemonic, seed };

    // Cargar transacciones e invoices
    await this.loadTransactions();
    await this.loadInvoices();

    // Calcular balance
    this.balance = 0;

    return {
      id,
      name: encryptedWallet.name || 'Wallet',
      balance: this.balance,
      hasBalance: this.balance > 0,
      defaultMint: this.defaultMint,
      createdAt: encryptedWallet.createdAt,
    };
  }

  /**
   * Bloquear wallet (limpiar de memoria)
   */
  lockWallet(): void {
    this.currentWallet = null;
    this.transactions = [];
    this.invoices = [];
    this.balance = 0;
  }

  /**
   * Verificar si hay wallet desbloqueada
   */
  isUnlocked(): boolean {
    return this.currentWallet !== null;
  }

  /**
   * Obtener mnemonic (solo si está desbloqueado)
   */
  getMnemonic(): string | null {
    return this.currentWallet?.mnemonic || null;
  }

  /**
   * Guardar transacción
   */
  private async saveTransaction(tx: Transaction): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(TX_DB_NAME, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const txObject = db.transaction([TX_STORE_NAME], 'readwrite');
        const store = txObject.objectStore(TX_STORE_NAME);
        const req = store.put(tx);
        
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
      };
    });
  }

  /**
   * Guardar invoice
   */
  private async saveInvoice(invoice: Invoice): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(TX_DB_NAME, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([INV_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(INV_STORE_NAME);
        const req = store.put(invoice);
        
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
      };
    });
  }

  /**
   * Cargar transacciones
   */
  private async loadTransactions(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(TX_DB_NAME, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([TX_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TX_STORE_NAME);
        const req = store.getAll();
        
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          this.transactions = req.result;
          resolve();
        };
      };
    });
  }

  /**
   * Cargar invoices
   */
  private async loadInvoices(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(TX_DB_NAME, 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([INV_STORE_NAME], 'readonly');
        const store = transaction.objectStore(INV_STORE_NAME);
        const req = store.getAll();
        
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          this.invoices = req.result;
          resolve();
        };
      };
    });
  }

  /**
   * Guardar estado en IndexedDB
   */
  private async saveState(): Promise<void> {
    if (!this.currentWallet) return;

    const state: WalletState = {
      id: this.currentWallet.id,
      name: 'Wallet',
      balance: this.balance,
      hasBalance: this.balance > 0,
      defaultMint: this.defaultMint,
      createdAt: Date.now(),
    };

    localStorage.setItem(`wallet_state_${this.currentWallet.id}`, JSON.stringify(state));
  }

  // ============================================
  // OPERACIONES DE PAGO
  // ============================================

  /**
   * Enviar pago Cashu (crear token para entregar)
   * 
   * @param amount - Cantidad en sats
   * @param memo - Descripción del pago (ej: "Pago a Juan por consultoría")
   * @param counterparty - Nostr pubkey o identifier del receptor
   */
  async send(amount: number, memo?: string, counterparty?: string): Promise<{
    token: string;
    transaction: Transaction;
  }> {
    if (!this.currentWallet) throw new Error('Wallet not unlocked');

    // En producción, esto usaría el Cashu SDK para:
    // 1. Seleccionar proofs del wallet
    // 2. Crear send transaction con P2SH
    // 3. Generar token con proofs restantes
    
    const txId = crypto.randomUUID();
    
    // Crear token simple (en producción usar Cashu SDK completo)
    const tokenData = {
      proofs: [{ amount, secret: crypto.randomUUID(), C: '01', id: 'test-mint' }],
      memo: memo || undefined,
      mint: this.defaultMint,
    } as any; // Type assertion para demo - en producción usar tipos completos del SDK
    const token = getEncodedToken(tokenData);

    const transaction: Transaction = {
      id: txId,
      type: 'send',
      amount,
      memo,
      counterparty,
      status: 'pending',
      createdAt: Date.now(),
      token,
    };

    await this.saveTransaction(transaction);
    this.transactions.push(transaction);

    return { token, transaction };
  }

  /**
   * Recibir pago Cashu (process token entrante)
   * 
   * @param token - Token Cashu para cobrar
   * @param memo - Memo personal para recordar (ej: "Pago de María")
   * @param payer - Nostr pubkey del pagador
   */
  async receive(token: string, memo?: string, payer?: string): Promise<{
    amount: number;
    transaction: Transaction;
  }> {
    if (!this.currentWallet) throw new Error('Wallet not unlocked');

    // Decodificar token
    const decoded = getDecodedToken(token);
    const amount = decoded.proofs.reduce((sum: number, p: any) => sum + p.amount, 0);

    const txId = crypto.randomUUID();
    const transaction: Transaction = {
      id: txId,
      type: 'receive',
      amount,
      memo,
      counterparty: payer,
      status: 'completed',
      createdAt: Date.now(),
      completedAt: Date.now(),
      token,
    };

    await this.saveTransaction(transaction);
    this.transactions.push(transaction);
    this.balance += amount;

    return { amount, transaction };
  }

  // ============================================
  // INVOICES
  // ============================================

  /**
   * Crear invoice para recibir pago
   * 
   * @param amount - Cantidad solicitada
   * @param memo - Descripción (ej: "Pago de hosting mensual")
   * @param payer - Nostr pubkey esperado (opcional)
   * @param expiresIn - Segundos hasta expiración (default: 1 hora)
   */
  async createInvoice(
    amount: number,
    memo: string,
    payer?: string,
    expiresIn: number = 3600
  ): Promise<Invoice> {
    if (!this.currentWallet) throw new Error('Wallet not unlocked');

    const id = `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const invoice: Invoice = {
      id,
      amount,
      memo,
      payer,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + expiresIn * 1000,
    };

    // En producción, esto crearía un mint quote y bolt11
    // const quote: MintQuoteResponse = await createMintQuote(amount);

    await this.saveInvoice(invoice);
    this.invoices.push(invoice);

    return invoice;
  }

  /**
   * Marcar invoice como pagado
   */
  async markInvoicePaid(invoiceId: string, token: string): Promise<void> {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.status = 'paid';
    invoice.paidAt = Date.now();

    await this.saveInvoice(invoice);

    await this.receive(token, `Invoice ${invoiceId}: ${invoice.memo}`);
  }

  /**
   * Cancelar invoice
   */
  async cancelInvoice(invoiceId: string): Promise<void> {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.status = 'cancelled';
    await this.saveInvoice(invoice);
  }

  // ============================================
  // HISTORIAL Y EXPORT
  // ============================================

  /**
   * Obtener historial de transacciones
   */
  getTransactions(filter?: {
    type?: 'send' | 'receive' | 'melt' | 'mint';
    limit?: number;
    offset?: number;
  }): Transaction[] {
    let result = [...this.transactions];

    if (filter?.type) {
      result = result.filter(t => t.type === filter.type);
    }

    result.sort((a, b) => b.createdAt - a.createdAt);

    const offset = filter?.offset || 0;
    const limit = filter?.limit || 100;

    return result.slice(offset, offset + limit);
  }

  /**
   * Obtener invoices
   */
  getInvoices(filter?: {
    status?: 'pending' | 'paid' | 'expired' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Invoice[] {
    let result = [...this.invoices];

    if (filter?.status) {
      result = result.filter(i => i.status === filter.status);
    }

    result.sort((a, b) => b.createdAt - a.createdAt);

    const offset = filter?.offset || 0;
    const limit = filter?.limit || 100;

    return result.slice(offset, offset + limit);
  }

  /**
   * Buscar transacción por memo
   */
  searchByMemo(query: string): Transaction[] {
    const lowerQuery = query.toLowerCase();
    return this.transactions.filter(t => 
      t.memo?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Exportar transacciones a JSON (para CryptoManager)
   */
  exportToJSON(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions: this.transactions,
      invoices: this.invoices,
      balance: this.balance,
    }, null, 2);
  }

  /**
   * Exportar transacciones a CSV
   */
  exportToCSV(): string {
    const headers = [
      'Date',
      'Type',
      'Amount (sats)',
      'Memo',
      'Counterparty',
      'Status',
      'Invoice ID',
    ];

    const rows = this.transactions.map(t => [
      new Date(t.createdAt).toISOString(),
      t.type,
      t.amount.toString(),
      `"${(t.memo || '').replace(/"/g, '""')}"`,
      `"${t.counterparty || ''}"`,
      t.status,
      t.invoiceId || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Importar transacciones desde JSON
   */
  async importFromJSON(jsonString: string): Promise<{
    transactionsImported: number;
    invoicesImported: number;
  }> {
    const data = JSON.parse(jsonString);

    let txCount = 0;
    let invCount = 0;

    if (data.transactions) {
      for (const tx of data.transactions) {
        if (!this.transactions.find(t => t.id === tx.id)) {
          await this.saveTransaction(tx);
          this.transactions.push(tx);
          txCount++;
        }
      }
    }

    if (data.invoices) {
      for (const inv of data.invoices) {
        if (!this.invoices.find(i => i.id === inv.id)) {
          await this.saveInvoice(inv);
          this.invoices.push(inv);
          invCount++;
        }
      }
    }

    return { transactionsImported: txCount, invoicesImported: invCount };
  }

  /**
   * Obtener balance actual
   */
  getBalance(): number {
    return this.balance;
  }

  /**
   * Obtener estado de wallet
   */
  getState(): WalletState | null {
    if (!this.currentWallet) return null;

    return {
      id: this.currentWallet.id,
      name: 'Wallet',
      balance: this.balance,
      hasBalance: this.balance > 0,
      defaultMint: this.defaultMint,
      createdAt: Date.now(),
    };
  }
}

// Exportar instancia singleton
export const cashuWallet = new CashuWalletService();
