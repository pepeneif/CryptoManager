/**
 * Cashu Wallet Components - Exports
 * 
 * Componentes React para integrar el wallet Cashu.
 * 
 * Uso rápido:
 * ```tsx
 * import { 
 *   CashuWalletProvider,
 *   useCashuWalletContext,
 *   WalletScreen,
 * } from './components';
 * 
 * // Envuelve tu app
 * <CashuWalletProvider>
 *   <App />
 * </CashuWalletProvider>
 * 
 * // Usa en cualquier componente
 * function MiComponente() {
 *   const { balance, send } = useCashuWalletContext();
 *   return <div>Balance: {balance}</div>;
 * }
 * 
 * // O usa la pantalla completa
 * <WalletScreen />
 * ```
 */

// Provider y Hook principal
export { CashuWalletProvider, useCashuWalletContext } from './CashuWalletProvider';
export type { UseCashuWalletReturn } from './CashuWalletProvider';

// Pantalla completa
export { WalletScreen } from './WalletScreen';

// Componentes individuales (para construir tu propia UI)
export { WalletSetup } from './WalletSetup';
export { SendPayment } from './SendPayment';
export { ReceivePayment } from './ReceivePayment';
export { CreateInvoice } from './CreateInvoice';
export { TransactionList } from './TransactionList';
export { InvoiceList } from './InvoiceList';

// Hook de bajo nivel
export { useCashuWallet } from './useCashuWallet';
