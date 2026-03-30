/**
 * CreateInvoice - Modal para crear invoice Cashu
 * 
 * Crea un invoice para que alguien te pague.
 * 
 * Uso:
 * ```tsx
 * <CreateInvoice 
 *   onClose={() => setShowInvoice(false)}
 *   onSuccess={() => setShowInvoice(false)}
 * />
 * ```
 */

import React, { useState } from 'react';
import { useCashuWalletContext } from './CashuWalletProvider';
import { type Invoice } from '../walletService';

interface CreateInvoiceProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateInvoice({ onClose, onSuccess }: CreateInvoiceProps) {
  const wallet = useCashuWalletContext();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [payer, setPayer] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  async function handleCreate() {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    try {
      const invoice = await wallet.createInvoice(amountNum, memo || 'Pago', payer || undefined);
      setCreatedInvoice(invoice);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creando invoice');
    }
  }

  function copyInvoiceId() {
    if (createdInvoice) {
      navigator.clipboard.writeText(createdInvoice.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  function formatExpiry(timestamp?: number) {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Crear Invoice</h2>

        {!createdInvoice ? (
          <>
            <p className="modal-description">
              Crea un invoice para que alguien te envíe sats. 
              Puedes compartir el ID del invoice o el bolt11 cuando esté disponible.
            </p>

            <div className="form-group">
              <label>Cantidad (sats)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="5000"
                min="1"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="Qué estás vendiendo o servicio"
              />
              <span className="hint">Ej: "Pago de hosting mensual"</span>
            </div>

            <div className="form-group">
              <label>Pagador esperado (opcional)</label>
              <input
                type="text"
                value={payer}
                onChange={e => setPayer(e.target.value)}
                placeholder="Nostr pubkey específico"
              />
              <span className="hint">Dejar vacío para aceptar de cualquiera</span>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="primary-btn"
                onClick={handleCreate}
                disabled={!amount || parseInt(amount) <= 0}
              >
                Crear Invoice
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-message">
              <span className="success-icon">📄</span>
              <p>Invoice creado</p>
            </div>

            <div className="invoice-display">
              <div className="invoice-amount">
                <span className="amount">{createdInvoice.amount.toLocaleString()}</span>
                <span className="unit">sats</span>
              </div>

              <div className="invoice-detail">
                <label>ID del Invoice</label>
                <div className="copyable">
                  <code>{createdInvoice.id}</code>
                  <button className="copy-btn" onClick={copyInvoiceId}>
                    {isCopied ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {createdInvoice.memo && (
                <div className="invoice-detail">
                  <label>Descripción</label>
                  <p>{createdInvoice.memo}</p>
                </div>
              )}

              <div className="invoice-detail">
                <label>Expira</label>
                <p>{formatExpiry(createdInvoice.expiresAt)}</p>
              </div>

              <div className="invoice-status pending">
                ⏳ Esperando pago
              </div>
            </div>

            <div className="invoice-info">
              <p>Comparte este invoice con quien debe pagarte.</p>
              <p>La lista de invoices pendientes está en la pestaña "Invoices".</p>
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={onSuccess}>
                Ver en lista
              </button>
            </div>
          </>
        )}

        {wallet.error && (
          <div className="error-message">{wallet.error}</div>
        )}
      </div>
    </div>
  );
}
