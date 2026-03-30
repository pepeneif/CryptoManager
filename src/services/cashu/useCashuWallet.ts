/**
 * useCashuWallet - React Hook para Cashu Wallet
 * 
 * Hook para integrar el wallet Cashu en cualquier componente React.
 * Maneja estado, loading, y errores automáticamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { cashuWallet, type Transaction, type Invoice, type WalletState } from './walletService';
import { secureStorage } from './secureStorage';

export interface UseCashuWalletReturn {
  // Estado
  isInitialized: boolean;
  isUnlocked: boolean;
  walletState: WalletState | null;
  transactions: Transaction[];
  invoices: Invoice[];
  balance: number;
  
  // Loading/Error
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  init: () => Promise<void>;
  createWallet: (name: string, password: string, mnemonic?: string) => Promise<string>;
  unlockWallet: (id: string, password: string) => Promise<WalletState>;
  lockWallet: () => void;
  send: (amount: number, memo?: string, counterparty?: string) => Promise<{ token: string; transaction: Transaction }>;
  receive: (token: string, memo?: string, payer?: string) => Promise<{ amount: number; transaction: Transaction }>;
  createInvoice: (amount: number, memo: string, payer?: string) => Promise<Invoice>;
  markInvoicePaid: (invoiceId: string, token: string) => Promise<void>;
  cancelInvoice: (invoiceId: string) => Promise<void>;
  exportToJSON: () => string;
  exportToCSV: () => string;
  importFromJSON: (json: string) => Promise<{ transactionsImported: number; invoicesImported: number }>;
  clearError: () => void;
}

export function useCashuWallet(): UseCashuWalletReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar
  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      await cashuWallet.init();
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error initializing wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear wallet
  const createWallet = useCallback(async (name: string, password: string, mnemonic?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const id = await cashuWallet.createWallet(name, password, mnemonic);
      setIsUnlocked(true);
      setWalletState(cashuWallet.getState());
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Desbloquear wallet
  const unlockWallet = useCallback(async (id: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const state = await cashuWallet.unlockWallet(id, password);
      setIsUnlocked(true);
      setWalletState(state);
      setTransactions(cashuWallet.getTransactions());
      setInvoices(cashuWallet.getInvoices());
      setBalance(cashuWallet.getBalance());
      return state;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error unlocking wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bloquear wallet
  const lockWallet = useCallback(() => {
    cashuWallet.lockWallet();
    setIsUnlocked(false);
    setWalletState(null);
    setTransactions([]);
    setInvoices([]);
    setBalance(0);
  }, []);

  // Enviar
  const send = useCallback(async (amount: number, memo?: string, counterparty?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await cashuWallet.send(amount, memo, counterparty);
      setTransactions(cashuWallet.getTransactions());
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error sending';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recibir
  const receive = useCallback(async (token: string, memo?: string, payer?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await cashuWallet.receive(token, memo, payer);
      setTransactions(cashuWallet.getTransactions());
      setBalance(cashuWallet.getBalance());
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error receiving';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear invoice
  const createInvoice = useCallback(async (amount: number, memo: string, payer?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const invoice = await cashuWallet.createInvoice(amount, memo, payer);
      setInvoices(cashuWallet.getInvoices());
      return invoice;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating invoice';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marcar invoice pagado
  const markInvoicePaid = useCallback(async (invoiceId: string, token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await cashuWallet.markInvoicePaid(invoiceId, token);
      setInvoices(cashuWallet.getInvoices());
      setTransactions(cashuWallet.getTransactions());
      setBalance(cashuWallet.getBalance());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error marking invoice paid';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar invoice
  const cancelInvoice = useCallback(async (invoiceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await cashuWallet.cancelInvoice(invoiceId);
      setInvoices(cashuWallet.getInvoices());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cancelling invoice';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Exportar
  const exportToJSON = useCallback(() => cashuWallet.exportToJSON(), []);
  const exportToCSV = useCallback(() => cashuWallet.exportToCSV(), []);

  // Importar
  const importFromJSON = useCallback(async (json: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await cashuWallet.importFromJSON(json);
      setTransactions(cashuWallet.getTransactions());
      setInvoices(cashuWallet.getInvoices());
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error importing';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => setError(null), []);

  return {
    isInitialized,
    isUnlocked,
    walletState,
    transactions,
    invoices,
    balance,
    isLoading,
    error,
    init,
    createWallet,
    unlockWallet,
    lockWallet,
    send,
    receive,
    createInvoice,
    markInvoicePaid,
    cancelInvoice,
    exportToJSON,
    exportToCSV,
    importFromJSON,
    clearError,
  };
}
