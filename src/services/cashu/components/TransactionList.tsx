/**
 * TransactionList - Lista de transacciones Cashu
 * 
 * Muestra historial de transacciones con filtros.
 * 
 * Uso:
 * ```tsx
 * <TransactionList transactions={wallet.transactions} />
 * ```
 */

import React, { useState } from 'react';
import { type Transaction } from '../walletService';

interface TransactionListProps {
  transactions: Transaction[];
}

type FilterType = 'all' | 'send' | 'receive';

export function TransactionList({ transactions }: TransactionListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar
  const filtered = transactions.filter(tx => {
    // Filtro por tipo
    if (filter !== 'all' && tx.type !== filter) return false;
    
    // Filtro por búsqueda (memo o counterparty)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.memo?.toLowerCase().includes(query) ||
        tx.counterparty?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'send': return '📤';
      case 'receive': return '📥';
      case 'melt': return '🔥';
      case 'mint': return '🪙';
      default: return '💸';
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'send': return 'Enviado';
      case 'receive': return 'Recibido';
      case 'melt': return 'Canjeado';
      case 'mint': return 'Minteado';
      default: return type;
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list empty">
        <div className="empty-icon">📭</div>
        <p>No hay transacciones aún</p>
        <p className="empty-hint">Envía o recibe tu primer pago Cashu</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {/* Filtros */}
      <div className="list-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`filter-tab ${filter === 'receive' ? 'active' : ''}`}
            onClick={() => setFilter('receive')}
          >
            Recibidas
          </button>
          <button 
            className={`filter-tab ${filter === 'send' ? 'active' : ''}`}
            onClick={() => setFilter('send')}
          >
            Enviadas
          </button>
        </div>
        
        <input
          type="search"
          className="search-input"
          placeholder="Buscar por memo..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="transactions">
        {filtered.map(tx => (
          <div key={tx.id} className={`transaction-item ${tx.type}`}>
            <div className="tx-icon">{getTypeIcon(tx.type)}</div>
            
            <div className="tx-details">
              <div className="tx-main">
                <span className="tx-amount">
                  {tx.type === 'send' ? '-' : '+'}{tx.amount.toLocaleString()}
                </span>
                <span className="tx-type">{getTypeLabel(tx.type)}</span>
              </div>
              
              {tx.memo && (
                <div className="tx-memo">{tx.memo}</div>
              )}
              
              <div className="tx-meta">
                <span className="tx-date">{formatDate(tx.createdAt)}</span>
                {tx.counterparty && (
                  <span className="tx-counterparty">
                    {tx.counterparty.slice(0, 8)}...
                  </span>
                )}
              </div>
            </div>

            <div className={`tx-status ${tx.status}`}>
              {tx.status === 'pending' && '⏳'}
              {tx.status === 'completed' && '✓'}
              {tx.status === 'failed' && '✗'}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="no-results">
            No hay transacciones que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  );
}
