/**
 * ReceivePayment - Modal para recibir pagos Cashu
 * 
 * Permite ingresar un token Cashu para cobrarlo.
 * 
 * Uso:
 * ```tsx
 * <ReceivePayment onClose={() => setShowReceive(false)} />
 * ```
 */

import React, { useState } from 'react';
import { useCashuWalletContext } from './CashuWalletProvider';

interface ReceivePaymentProps {
  onClose: () => void;
}

export function ReceivePayment({ onClose }: ReceivePaymentProps) {
  const wallet = useCashuWalletContext();
  const [token, setToken] = useState('');
  const [memo, setMemo] = useState('');
  const [payer, setPayer] = useState('');
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleReceive() {
    if (!token.trim()) {
      alert('Ingresa un token válido');
      return;
    }

    setIsProcessing(true);
    try {
      const { amount } = await wallet.receive(token, memo || undefined, payer || undefined);
      setReceivedAmount(amount);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Token inválido o ya usado');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Recibir Pago</h2>

        {receivedAmount !== null ? (
          <>
            <div className="success-message">
              <span className="success-icon">🎉</span>
              <p>¡Pago recibido!</p>
              <div className="received-amount">
                +{receivedAmount.toLocaleString()} <small>sats</small>
              </div>
            </div>

            {memo && (
              <div className="memo-display">
                <label>Memo:</label>
                <p>{memo}</p>
              </div>
            )}

            <div className="new-balance">
              Nuevo balance: <strong>{wallet.balance.toLocaleString()} sats</strong>
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-description">
              Pega el token Cashu que recibiste para añadir los fondos a tu wallet.
            </p>

            <div className="form-group">
              <label>Token Cashu</label>
              <textarea
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="cashuAeyJ..."
                rows={4}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Memo personal (opcional)</label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="Ej: 'Pago de María'"
              />
              <span className="hint">Nota para recordar quién te pagó</span>
            </div>

            <div className="form-group">
              <label>Pagador (opcional)</label>
              <input
                type="text"
                value={payer}
                onChange={e => setPayer(e.target.value)}
                placeholder="Nostr pubkey del pagador"
              />
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="primary-btn"
                onClick={handleReceive}
                disabled={!token.trim() || isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Cobrar'}
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
