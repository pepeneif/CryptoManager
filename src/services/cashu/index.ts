/**
 * Cashu Service — Exports
 * 
 * Módulo de wallet Cashu para CryptoManager
 * 
 * Uso rápido:
 * ```tsx
 * // 1. Envolver tu app con el Provider
 * import { CashuWalletProvider } from './services/cashu';
 * 
 * function App() {
 *   return (
 *     <CashuWalletProvider>
 *       <TuApp />
 *     </CashuWalletProvider>
 *   );
 * }
 * 
 * // 2. Usar en cualquier componente
 * import { useCashuWalletContext } from './services/cashu';
 * 
 * function MiComponente() {
 *   const { balance, send } = useCashuWalletContext();
 *   return <div>Balance: {balance} sats</div>;
 * }
 * 
 * // 3. O usar la pantalla completa lista
 * import { WalletScreen } from './services/cashu';
 * <WalletScreen />
 * ```
 * 
 * Uso standalone (sin React):
 * ```ts
 * import { cashuWallet, secureStorage } from './services/cashu';
 * 
 * await cashuWallet.init();
 * const id = await cashuWallet.createWallet('Mi Wallet', 'password123');
 * const { token } = await cashuWallet.send(1000, 'Pago a Juan');
 * const csv = cashuWallet.exportToCSV();
 * ```
 */

// Servicios core (usable sin React)
export { SecureStorageService, type EncryptedWallet, type WalletMetadata } from './secureStorage';
export { CashuWalletService, type Transaction, type Invoice, type WalletState } from './walletService';

// Instancias singleton (conveniencia)
export { secureStorage } from './secureStorage';
export { cashuWallet } from './walletService';

// Hook de React
export { useCashuWallet } from './useCashuWallet';

// Provider y componentes UI
export { 
  CashuWalletProvider, 
  useCashuWalletContext,
  WalletScreen,
  WalletSetup,
  SendPayment,
  ReceivePayment,
  CreateInvoice,
  TransactionList,
  InvoiceList,
} from './components';
export type { UseCashuWalletReturn } from './components';
