/**
 * SendPayment - Modal para enviar pagos Cashu
 * 
 * Permite enviar un token Cashu con memo opcional.
 * 
 * Uso:
 * ```tsx
 * <SendPayment 
 *   onClose={() => setShowSend(false)}
 *   onSuccess={() => {
 *     console.log('Pago enviado!');
 *     setShowSend(false);
 *   }}
 * />
 * ```
 */

import React, { useState } from 'react';
import { useCashuWalletContext } from './CashuWalletProvider';

interface SendPaymentProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SendPayment({ onClose, onSuccess }: SendPaymentProps) {
  const wallet = useCashuWalletContext();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  async function handleSend() {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    try {
      const { token } = await wallet.send(amountNum, memo || undefined, counterparty || undefined);
      setGeneratedToken(token);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error enviando pago');
    }
  }

  function copyToken() {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }

  function handleDone() {
    onSuccess();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Enviar Pago</h2>

        {!generatedToken ? (
          <>
            <div className="form-group">
              <label>Cantidad (sats)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="1000"
                min="1"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Memo (opcional)</label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="Descripción del pago"
              />
              <span className="hint">Ej: "Pago a Juan por consultoría"</span>
            </div>

            <div className="form-group">
              <label>Destinatario (opcional)</label>
              <input
                type="text"
                value={counterparty}
                onChange={e => setCounterparty(e.target.value)}
                placeholder="Nostr pubkey o identifier"
              />
            </div>

            <div className="balance-hint">
              Tu balance: <strong>{wallet.balance.toLocaleString()} sats</strong>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="primary-btn"
                onClick={handleSend}
                disabled={!amount || parseInt(amount) <= 0}
              >
                Crear Token
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-message">
              <span className="success-icon">✅</span>
              <p>Token creado exitosamente</p>
            </div>

            <div className="token-display">
              <label>Token Cashu (envía esto al receptor)</label>
              <div className="token-box">
                <code>{generatedToken.slice(0, 50)}...</code>
                <button className="copy-btn" onClick={copyToken}>
                  {isCopied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>

            <div className="token-info">
              <p>Envía este token al destinatario para que pueda cobrarlo.</p>
              <p>También puedes usarlo tú mismo en otra wallet.</p>
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleDone}>
                Listo
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
