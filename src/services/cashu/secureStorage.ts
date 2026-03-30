/**
 * Secure Storage Service — Web Crypto API
 * 
 * Maneja el almacenamiento seguro de mnemonic seed phrases
 * usando AES-256-GCM encryption en IndexedDB.
 * 
 * Flujo:
 * 1. Generar/importar mnemonic
 * 2. Derivar clave AES-256 del password del usuario
 * 3. Encriptar mnemonic y guardar en IndexedDB
 * 4. Para acceder: pedir password → desencriptar
 */

const DB_NAME = 'CryptoManagerWallet';
const STORE_NAME = 'wallets';
const DB_VERSION = 1;

// Tipos
export interface EncryptedWallet {
  id: string;
  salt: number[];      // 16 bytes
  iv: number[];        // 12 bytes para AES-GCM
  data: number[];      // Mnemonic encriptado
  createdAt: number;
  name?: string;
}

export interface WalletMetadata {
  id: string;
  name: string;
  createdAt: number;
  hasBalance: boolean;
}

// Helper para convertir Uint8Array a ArrayBuffer (evita SharedArrayBuffer)
function uint8ToBuffer(arr: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(arr.length);
  new Uint8Array(buffer).set(arr);
  return buffer;
}

// Clase principal
export class SecureStorageService {
  private db: IDBDatabase | null = null;

  /**
   * Inicializar IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Generar salt aleatorio de 16 bytes
   */
  private generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  /**
   * Generar IV aleatorio de 12 bytes para AES-GCM
   */
  private generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  }

  /**
   * Derivar clave AES-256 del password usando PBKDF2
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      uint8ToBuffer(encoder.encode(password)),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: uint8ToBuffer(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encriptar mnemonic con AES-256-GCM
   */
  async encryptMnemonic(mnemonic: string, password: string): Promise<{
    salt: number[];
    iv: number[];
    data: number[];
  }> {
    const salt = this.generateSalt();
    const iv = this.generateIV();
    const key = await this.deriveKey(password, salt);

    const encoder = new TextEncoder();
    const encodedMnemonic = encoder.encode(mnemonic);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: uint8ToBuffer(iv) },
      key,
      uint8ToBuffer(encodedMnemonic)
    );

    return {
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    };
  }

  /**
   * Desencriptar mnemonic
   */
  async decryptMnemonic(encryptedData: EncryptedWallet, password: string): Promise<string> {
    const salt = new Uint8Array(encryptedData.salt);
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    const key = await this.deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: uint8ToBuffer(iv) },
      key,
      uint8ToBuffer(data)
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Guardar wallet encriptada en IndexedDB
   */
  async saveWallet(
    id: string,
    mnemonic: string,
    password: string,
    name?: string
  ): Promise<void> {
    if (!this.db) await this.init();

    const { salt, iv, data } = await this.encryptMnemonic(mnemonic, password);

    const wallet: EncryptedWallet = {
      id,
      salt,
      iv,
      data,
      createdAt: Date.now(),
      name,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(wallet);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Cargar wallet de IndexedDB (encriptada)
   */
  async loadWallet(id: string): Promise<EncryptedWallet | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Listar todas las wallets guardadas (solo metadata)
   */
  async listWallets(): Promise<WalletMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const wallets = request.result.map((w: EncryptedWallet) => ({
          id: w.id,
          name: w.name || 'Wallet',
          createdAt: w.createdAt,
          hasBalance: false,
        }));
        resolve(wallets);
      };
    });
  }

  /**
   * Eliminar wallet
   */
  async deleteWallet(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Verificar si existe una wallet
   */
  async hasWallet(id: string): Promise<boolean> {
    const wallet = await this.loadWallet(id);
    return wallet !== null;
  }

  /**
   * Cambiar password de una wallet
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const wallet = await this.loadWallet(id);
    if (!wallet) throw new Error('Wallet not found');

    const mnemonic = await this.decryptMnemonic(wallet, oldPassword);
    await this.saveWallet(id, mnemonic, newPassword, wallet.name);
  }
}

// Exportar instancia singleton
export const secureStorage = new SecureStorageService();
