/**
 * InvoiceList - Lista de invoices Cashu
 * 
 * Muestra invoices pendientes y pasados con acciones.
 * 
 * Uso:
 * ```tsx
 * <InvoiceList 
 *   invoices={wallet.invoices}
 *   onMarkPaid={wallet.markInvoicePaid}
 *   onCancel={wallet.cancelInvoice}
 * />
 * ```
 */

import React, { useState } from 'react';
import { type Invoice } from '../walletService';

interface InvoiceListProps {
  invoices: Invoice[];
  onMarkPaid: (invoiceId: string, token: string) => Promise<void>;
  onCancel: (invoiceId: string) => Promise<void>;
}

type FilterStatus = 'all' | 'pending' | 'paid' | 'expired' | 'cancelled';

export function InvoiceList({ invoices, onMarkPaid, onCancel }: InvoiceListProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showMarkPaidModal, setShowMarkPaidModal] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');

  // Filtrar
  const filtered = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  function formatDate(timestamp?: number) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <span className="badge pending">⏳ Pendiente</span>;
      case 'paid':
        return <span className="badge paid">✓ Pagado</span>;
      case 'expired':
        return <span className="badge expired">❌ Expirado</span>;
      case 'cancelled':
        return <span className="badge cancelled">✕ Cancelado</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  }

  function getTimeRemaining(expiresAt?: number) {
    if (!expiresAt) return null;
    const now = Date.now();
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expirado';
    
    const minutes = Math.floor(remaining / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  async function handleMarkPaid(invoiceId: string) {
    if (!tokenInput.trim()) {
      alert('Ingresa el token del pago');
      return;
    }

    try {
      await onMarkPaid(invoiceId, tokenInput);
      setShowMarkPaidModal(null);
      setTokenInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error marcando como pagado');
    }
  }

  async function handleCancel(invoiceId: string) {
    if (!confirm('¿Cancelar este invoice?')) return;
    
    try {
      await onCancel(invoiceId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error cancelando');
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="invoice-list empty">
        <div className="empty-icon">📄</div>
        <p>No hay invoices</p>
        <p className="empty-hint">Crea un invoice para recibir pagos</p>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      {/* Filtros */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
        <button 
          className={`filter-tab ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          Pagados
        </button>
      </div>

      {/* Lista */}
      <div className="invoices">
        {filtered.map(inv => (
          <div key={inv.id} className={`invoice-item ${inv.status}`}>
            <div className="inv-header">
              <span className="inv-amount">
                {inv.amount.toLocaleString()} <small>sats</small>
              </span>
              {getStatusBadge(inv.status)}
            </div>

            {inv.memo && (
              <div className="inv-memo">{inv.memo}</div>
            )}

            <div className="inv-meta">
              <span className="inv-id" title={inv.id}>
                ID: {inv.id.slice(0, 20)}...
              </span>
              <span className="inv-date">
                Creado: {formatDate(inv.createdAt)}
              </span>
            </div>

            {inv.status === 'pending' && inv.expiresAt && (
              <div className="inv-expiry">
                Expira en: {getTimeRemaining(inv.expiresAt)}
              </div>
            )}

            {inv.status === 'paid' && inv.paidAt && (
              <div className="inv-paid-date">
                Pagado: {formatDate(inv.paidAt)}
              </div>
            )}

            {/* Acciones */}
            {inv.status === 'pending' && (
              <div className="inv-actions">
                <button 
                  className="action-btn small"
                  onClick={() => setShowMarkPaidModal(inv.id)}
                >
                  Marcar pagado
                </button>
                <button 
                  className="action-btn small danger"
                  onClick={() => handleCancel(inv.id)}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="no-results">
            No hay invoices con ese filtro
          </div>
        )}
      </div>

      {/* Modal para marcar como pagado */}
      {showMarkPaidModal && (
        <div className="modal-overlay" onClick={() => setShowMarkPaidModal(null)}>
          <div className="modal small" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowMarkPaidModal(null)}
            >
              ✕
            </button>
            
            <h3>Marcar Invoice como Pagado</h3>
            <p className="modal-description">
              Ingresa el token que recibiste como pago para este invoice.
            </p>

            <div className="form-group">
              <label>Token Cashu</label>
              <textarea
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="cashuAeyJ..."
                rows={3}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button 
                className="secondary-btn"
                onClick={() => setShowMarkPaidModal(null)}
              >
                Cancelar
              </button>
              <button 
                className="primary-btn"
                onClick={() => handleMarkPaid(showMarkPaidModal)}
                disabled={!tokenInput.trim()}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
