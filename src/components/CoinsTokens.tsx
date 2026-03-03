import { useState, useEffect } from 'react'

interface Props {
  token: string
}

interface Coin {
  id: number
  symbol: string
  name: string
  blockchain: string
  type: 'coin' | 'token' | 'stablecoin'
  enabled: number
  is_custom: number
  created_at: string
}

// Blockchains disponibles
const BLOCKCHAINS = [
  { id: 'ETH', name: 'Ethereum' },
  { id: 'SOL', name: 'Solana' },
  { id: 'TRX', name: 'Tron' },
  { id: 'MATIC', name: 'Polygon' },
  { id: 'BSC', name: 'Binance Smart Chain' },
  { id: 'AVAX', name: 'Avalanche' },
  { id: 'ARB', name: 'Arbitrum' },
  { id: 'OPT', name: 'Optimism' },
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'XRP', name: 'Ripple' },
  { id: 'ADA', name: 'Cardano' },
  { id: 'DOGE', name: 'Dogecoin' },
  { id: 'DOT', name: 'Polkadot' },
  { id: 'ATOM', name: 'Cosmos' },
]

export default function CoinsTokens({ token }: Props) {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [newCoin, setNewCoin] = useState({
    name: '',
    symbol: '',
    blockchain: 'ETH',
    type: 'token' as 'coin' | 'token' | 'stablecoin'
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Edit state
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editData, setEditData] = useState({
    name: '',
    symbol: '',
    blockchain: 'ETH'
  })

  useEffect(() => {
    fetchCoins()
  }, [])

  const fetchCoins = async () => {
    try {
      const response = await fetch('/api/coins', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCoins(data)
      } else {
        const errData = await response.json()
        setError(errData.error || 'Error al cargar monedas')
      }
    } catch (err) {
      console.error('Error fetching coins:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const crearMoneda = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCoin.name || !newCoin.symbol) {
      setMessage('Por favor completa el nombre y símbolo')
      return
    }

    const upperSymbol = newCoin.symbol.toUpperCase()
    
    // Verificar si ya existe
    const exists = coins.some(
      (c) => c.symbol === upperSymbol && c.blockchain === newCoin.blockchain
    )
    
    if (exists) {
      setMessage('Esta moneda ya está registrada en esta blockchain')
      return
    }

    try {
      const response = await fetch('/api/coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: upperSymbol,
          name: newCoin.name,
          blockchain: newCoin.blockchain,
          type: newCoin.type,
          enabled: true,
          is_custom: true
        }),
      })

      if (response.ok) {
        setNewCoin({ name: '', symbol: '', blockchain: 'ETH', type: 'token' })
        setShowForm(false)
        setMessage('Moneda agregada correctamente')
        setTimeout(() => setMessage(''), 3000)
        fetchCoins()
      } else {
        const errData = await response.json()
        setMessage(errData.error || 'Error al agregar moneda')
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage('Error al agregar moneda')
    }
  }

  const eliminarMoneda = async (id: number) => {
    if (!confirm('¿Eliminar esta moneda?')) return
    try {
      const response = await fetch(`/api/coins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setMessage('Moneda eliminada')
        setTimeout(() => setMessage(''), 3000)
        fetchCoins()
      } else {
        const errData = await response.json()
        setMessage(errData.error || 'Error al eliminar moneda')
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage('Error al eliminar moneda')
    }
  }

  const iniciarEdicion = (coin: Coin) => {
    setEditandoId(coin.id)
    setEditData({
      name: coin.name,
      symbol: coin.symbol,
      blockchain: coin.blockchain
    })
  }

  const guardarEdicion = async (id: number) => {
    try {
      const response = await fetch(`/api/coins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          symbol: editData.symbol.toUpperCase(),
          blockchain: editData.blockchain
        }),
      })
      if (response.ok) {
        setEditandoId(null)
        fetchCoins()
      } else {
        const errData = await response.json()
        setMessage(errData.error || 'Error al actualizar moneda')
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage('Error al actualizar moneda')
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditData({ name: '', symbol: '', blockchain: 'ETH' })
  }

  const toggleEnabled = async (coin: Coin) => {
    try {
      await fetch(`/api/coins/${coin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !coin.enabled }),
      })
      fetchCoins()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const filteredCoins = coins.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.blockchain.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'coin': return 'Coin'
      case 'token': return 'Token'
      case 'stablecoin': return 'Stable'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'coin': return '#4a90d9'
      case 'token': return '#9b59b6'
      case 'stablecoin': return '#27ae60'
      default: return '#888'
    }
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      {message && (
        <div style={{ 
          padding: '10px 20px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          background: message.includes('Error') ? 'var(--color-error)' : 'var(--color-success)',
          color: 'white'
        }}>
          {message}
        </div>
      )}

      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Coins y Tokens</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showForm && (
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ fontSize: '0.9em', padding: '8px 14px' }} 
              onClick={() => setShowForm(true)}
            >
              + Nueva Moneda
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nueva Moneda</h2>
          <form onSubmit={crearMoneda}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input 
                type="text" 
                value={newCoin.name} 
                onChange={(e) => setNewCoin({ ...newCoin, name: e.target.value })} 
                placeholder="Nombre (ej: Bitcoin)" 
                style={{ flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} 
                required 
              />
              <input 
                type="text" 
                value={newCoin.symbol} 
                onChange={(e) => setNewCoin({ ...newCoin, symbol: e.target.value.toUpperCase() })} 
                placeholder="Símbolo (ej: BTC)" 
                style={{ flex: '0 1 120px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} 
                required 
              />
              <select 
                value={newCoin.blockchain} 
                onChange={(e) => setNewCoin({ ...newCoin, blockchain: e.target.value })}
                style={{ flex: '0 1 180px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                {BLOCKCHAINS.map((bc) => (
                  <option key={bc.id} value={bc.id}>{bc.name}</option>
                ))}
              </select>
              <select 
                value={newCoin.type} 
                onChange={(e) => setNewCoin({ ...newCoin, type: e.target.value as 'coin' | 'token' | 'stablecoin' })}
                style={{ flex: '0 1 120px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                <option value="token">Token</option>
                <option value="coin">Coin</option>
                <option value="stablecoin">Stablecoin</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }} 
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Monedas Configuradas ({filteredCoins.length})</h2>
          <input
            type="text"
            placeholder="Buscar monedas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              maxWidth: '300px',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        ) : filteredCoins.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            No hay monedas{searchTerm ? ' que coincidan con la búsqueda' : '.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Símbolo</th>
                <th>Blockchain</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin) => (
                <tr key={coin.id}>
                  {editandoId === coin.id ? (
                    <>
                      <td>
                        <input 
                          type="text" 
                          value={editData.name} 
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                          style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editData.symbol} 
                          onChange={(e) => setEditData({ ...editData, symbol: e.target.value.toUpperCase() })} 
                          style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} 
                        />
                      </td>
                      <td>
                        <select 
                          value={editData.blockchain} 
                          onChange={(e) => setEditData({ ...editData, blockchain: e.target.value })}
                          style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                        >
                          {BLOCKCHAINS.map((bc) => (
                            <option key={bc.id} value={bc.id}>{bc.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>-</td>
                      <td>-</td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} 
                          onClick={() => guardarEdicion(coin.id)}
                        >
                          Guardar
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} 
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ color: 'var(--text-primary)' }}>{coin.name}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{coin.symbol}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{coin.blockchain}</td>
                      <td>
                        <span 
                          style={{ 
                            fontSize: '0.75em', 
                            padding: '3px 8px', 
                            borderRadius: '10px',
                            background: getTypeColor(coin.type),
                            color: 'white',
                            textTransform: 'uppercase'
                          }}
                        >
                          {getTypeLabel(coin.type)}
                        </span>
                      </td>
                      <td>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={coin.enabled === 1}
                            onChange={() => toggleEnabled(coin)}
                            style={{ marginRight: '5px', accentColor: 'var(--accent-color)' }}
                          />
                          <span style={{ color: coin.enabled ? 'var(--color-success)' : 'var(--text-secondary)', fontSize: '0.9em' }}>
                            {coin.enabled ? 'Activo' : 'Inactivo'}
                          </span>
                        </label>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} 
                          onClick={() => iniciarEdicion(coin)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '5px 10px', fontSize: '0.8em', background: 'var(--color-error)' }} 
                          onClick={() => eliminarMoneda(coin.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
