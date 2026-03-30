/**
 * WalletScreen - Pantalla principal del Wallet Cashu
 * 
 * Muestra balance, acciones principales, y acceso a historial.
 * 
 * Uso:
 * ```tsx
 * import { WalletScreen } from './services/cashu/components/WalletScreen';
 * 
 * <WalletScreen />
 * ```
 */

import React, { useState } from 'react';
import { useCashuWalletContext } from './CashuWalletProvider';
import { SendPayment } from './SendPayment';
import { ReceivePayment } from './ReceivePayment';
import { CreateInvoice } from './CreateInvoice';
import { TransactionList } from './TransactionList';
import { InvoiceList } from './InvoiceList';
import { WalletSetup } from './WalletSetup';

export function WalletScreen() {
  const wallet = useCashuWalletContext();
  const [activeTab, setActiveTab] = useState<'transactions' | 'invoices'>('transactions');
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Si no está inicializado
  if (!wallet.isInitialized) {
    return (
      <div className="cashu-wallet loading">
        <div className="spinner"></div>
        <p>Inicializando wallet...</p>
      </div>
    );
  }

  // Si no hay wallet o está bloqueado
  if (!wallet.isUnlocked) {
    return <WalletSetup />;
  }

  return (
    <div className="cashu-wallet">
      {/* Header con Balance */}
      <div className="wallet-header">
        <div className="balance-section">
          <span className="balance-label">Balance</span>
          <span className="balance-amount">
            {wallet.balance.toLocaleString()} <small>sats</small>
          </span>
        </div>
        <button className="lock-btn" onClick={wallet.lockWallet} title="Bloquear wallet">
          🔒
        </button>
      </div>

      {/* Acciones principales */}
      <div className="wallet-actions">
        <button className="action-btn" onClick={() => setShowSend(true)}>
          <span className="action-icon">📤</span>
          <span>Enviar</span>
        </button>
        <button className="action-btn" onClick={() => setShowReceive(true)}>
          <span className="action-icon">📥</span>
          <span>Recibir</span>
        </button>
        <button className="action-btn" onClick={() => setShowInvoice(true)}>
          <span className="action-icon">📄</span>
          <span>Invoice</span>
        </button>
      </div>

      {/* Tabs para historial */}
      <div className="wallet-tabs">
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transacciones
        </button>
        <button 
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
      </div>

      {/* Contenido del tab */}
      <div className="wallet-content">
        {activeTab === 'transactions' ? (
          <TransactionList transactions={wallet.transactions} />
        ) : (
          <InvoiceList 
            invoices={wallet.invoices} 
            onMarkPaid={wallet.markInvoicePaid}
            onCancel={wallet.cancelInvoice}
          />
        )}
      </div>

      {/* Modales */}
      {showSend && (
        <SendPayment 
          onClose={() => setShowSend(false)}
          onSuccess={() => setShowSend(false)}
        />
      )}
      {showReceive && (
        <ReceivePayment 
          onClose={() => setShowReceive(false)}
        />
      )}
      {showInvoice && (
        <CreateInvoice 
          onClose={() => setShowInvoice(false)}
          onSuccess={() => setShowInvoice(false)}
        />
      )}

      {/* Error toast */}
      {wallet.error && (
        <div className="error-toast" onClick={wallet.clearError}>
          ⚠️ {wallet.error}
        </div>
      )}
    </div>
  );
}
