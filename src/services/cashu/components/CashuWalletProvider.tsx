/**
 * CashuWalletProvider - React Context para Cashu Wallet
 * 
 * Envuelve la app y provee acceso al wallet desde cualquier componente.
 * 
 * Uso:
 * ```tsx
 * // En main.tsx o App.tsx
 * import { CashuWalletProvider } from './services/cashu/components/CashuWalletProvider';
 * 
 * function App() {
 *   return (
 *     <CashuWalletProvider>
 *       <TuApp />
 *     </CashuWalletProvider>
 *   );
 * }
 * 
 * // En cualquier componente
 * import { useCashuWalletContext } from './services/cashu/components/CashuWalletProvider';
 * 
 * function MiComponente() {
 *   const { balance, send } = useCashuWalletContext();
 *   return <div>Balance: {balance} sats</div>;
 * }
 * ```
 */

import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useCashuWallet, type UseCashuWalletReturn } from './useCashuWallet';

// Crear contexto
const CashuWalletContext = createContext<UseCashuWalletReturn | null>(null);

// Hook para usar el contexto
export function useCashuWalletContext(): UseCashuWalletReturn {
  const context = useContext(CashuWalletContext);
  if (!context) {
    throw new Error('useCashuWalletContext must be used within CashuWalletProvider');
  }
  return context;
}

// Props del provider
interface CashuWalletProviderProps {
  children: ReactNode;
  /** Auto-inicializar al montar (default: true) */
  autoInit?: boolean;
  /** Mint por defecto para nuevas wallets */
  defaultMint?: string;
  /** Callback cuando hay un nuevo pago recibido */
  onPaymentReceived?: (amount: number, memo?: string) => void;
}

// Provider component
export function CashuWalletProvider({
  children,
  autoInit = true,
  defaultMint,
  onPaymentReceived,
}: CashuWalletProviderProps) {
  const wallet = useCashuWallet();
  
  // Auto-init
  useEffect(() => {
    if (autoInit && !wallet.isInitialized) {
      wallet.init();
    }
  }, [autoInit, wallet.isInitialized, wallet.init]);

  // Notificar cuando llega un pago
  useEffect(() => {
    if (wallet.transactions.length > 0) {
      const lastTx = wallet.transactions[0];
      if (lastTx?.type === 'receive' && lastTx.status === 'completed') {
        onPaymentReceived?.(lastTx.amount, lastTx.memo);
      }
    }
  }, [wallet.transactions, onPaymentReceived]);

  return (
    <CashuWalletContext.Provider value={wallet}>
      {children}
    </CashuWalletContext.Provider>
  );
}

export { type UseCashuWalletReturn } from './useCashuWallet';
