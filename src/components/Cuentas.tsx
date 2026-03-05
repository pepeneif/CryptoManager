import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Wallet {
  id: number
  name: string
  tipo: string
  moneda: string
  balance: number
}

interface CryptoCoin {
  id: number
  symbol: string
  name: string
  blockchain: string
  type: 'coin' | 'token' | 'stablecoin'
  enabled: number
  is_custom: number
}

interface WalletsProps {
  token: string
}

// Default coins if no config exists
const DEFAULT_COINS: CryptoCoin[] = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', blockchain: 'BTC', type: 'coin', enabled: 1, is_custom: 0 },
  { id: 2, symbol: 'ETH', name: 'Ethereum', blockchain: 'ETH', type: 'coin', enabled: 1, is_custom: 0 },
  { id: 3, symbol: 'SOL', name: 'Solana', blockchain: 'SOL', type: 'coin', enabled: 1, is_custom: 0 },
]

export default function Wallets({ token }: WalletsProps) {
  const { empresaId } = useParams()
  const navigate = useNavigate()
  const [cuentas, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [coins, setCoins] = useState<CryptoCoin[]>(DEFAULT_COINS)
  const [newWallet, setNewWallet] = useState({
    name: '',
    tipo: '',
    moneda: '',
    address: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<'name' | 'tipo' | 'moneda' | 'wallet_address' | 'balance'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>('default')

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      if (column === 'balance') {
        // Balance: desc -> asc -> default
        if (sortDirection === 'desc') setSortDirection('asc')
        else if (sortDirection === 'asc') { setSortDirection('default'); setSortColumn('name') }
        else setSortDirection('desc')
      } else {
        // Others: asc -> desc -> default
        if (sortDirection === 'asc') setSortDirection('desc')
        else if (sortDirection === 'desc') { setSortDirection('default'); setSortColumn('name') }
        else setSortDirection('asc')
      }
    } else {
      setSortColumn(column)
      // Default to desc for balance, asc for others
      setSortDirection(column === 'balance' ? 'desc' : 'asc')
    }
  }

  const getSortIcon = (column: typeof sortColumn) => {
    if (sortColumn !== column) return ''
    if (sortDirection === 'asc') return ' ↑'
    if (sortDirection === 'desc') return ' ↓'
    return ''
  }

  // Sort cuentas
  const sortedCuentas = [...cuentas].sort((a, b) => {
    if (sortDirection === 'default') {
      return a.name.localeCompare(b.name)
    }
    
    let valA: any, valB: any
    switch (sortColumn) {
      case 'name': valA = a.name || ''; valB = b.name || ''; break
      case 'tipo': valA = a.tipo || ''; valB = b.tipo || ''; break
      case 'moneda': valA = a.moneda || ''; valB = b.moneda || ''; break
      case 'wallet_address': valA = a.wallet_address || ''; valB = b.wallet_address || ''; break
      case 'balance': valA = a.balance || 0; valB = b.balance || 0; break
      default: return 0
    }
    
    if (typeof valA === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    // For numbers (balance)
    if (sortColumn === 'balance') {
      return sortDirection === 'asc' ? valA - valB : valB - valA
    }
    return 0
  })

  // Load enabled coins from API
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('/api/coins', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json() as CryptoCoin[]
          // Filter only enabled coins
          const enabledCoins = data.filter(coin => coin.enabled === 1)
          
          if (enabledCoins.length > 0) {
            setCoins(enabledCoins)
            setNewWallet(prev => ({ 
              ...prev, 
              tipo: String(enabledCoins[0].id), 
              moneda: enabledCoins[0].symbol 
            }))
          } else {
            setCoins(DEFAULT_COINS)
          }
        } else {
          setCoins(DEFAULT_COINS)
        }
      } catch (err) {
        console.error('Error loading coins config:', err)
        // Fall back to defaults
        setCoins(DEFAULT_COINS)
      }
    }
    fetchCoins()
  }, [token])

  useEffect(() => {
    fetchWallets()
  }, [empresaId])

  const fetchWallets = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/cuentas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setWallets(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/empresas/${empresaId}/cuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newWallet.name,
          tipo: newWallet.tipo,
          moneda: newWallet.moneda || coins.find(c => String(c.id) === newWallet.tipo)?.symbol || '',
          wallet_address: newWallet.address // Map address to wallet_address
        }),
      })
      if (response.ok) {
        setNewWallet({ name: '', tipo: String(coins[0]?.id) || '', moneda: coins[0]?.symbol || '', address: '' })
        fetchWallets()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const totalBalance = cuentas.reduce((sum, c) => sum + c.balance, 0)

  const filteredCuentas = sortedCuentas.filter(cuenta =>
    cuenta.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cuenta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cuenta.wallet_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    cuenta.moneda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coins.find(c => String(c.id) === cuenta.tipo)?.name.toLowerCase() + coins.find(c => String(c.id) === cuenta.tipo)?.symbol.toLowerCase() + coins.find(c => String(c.id) === cuenta.tipo)?.blockchain.toLowerCase()).includes(searchTerm.toLowerCase()) ||
    cuenta.balance.toString().includes(searchTerm)
  )

  return (
    <div className="dashboard">
      <div className="header">
        <h1 style={{ margin: 0 }}>Wallets</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showForm && (
            <button type="button" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 14px' }} onClick={() => setShowForm(true)}>
              + Nueva Wallet
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2>Total: ${totalBalance.toLocaleString()}</h2>
      </div>

      {showForm && (
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nueva Wallet</h2>
        <form onSubmit={crearWallet} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newWallet.name}
            onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
            placeholder="Nombre de la wallet"
            required
            style={{ flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            value={newWallet.address}
            onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
            placeholder="Address de la wallet"
            required
            style={{ flex: '1 1 300px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
          <select
            value={newWallet.tipo}
            onChange={(e) => {
              const selectedCoin = coins.find(c => String(c.id) === e.target.value)
              setNewWallet({ ...newWallet, tipo: e.target.value, moneda: selectedCoin?.symbol || '' })
            }}
            required
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            aria-label="Criptomoneda"
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol}) - {coin.blockchain}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }} onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}>Crear</button>
          </div>
        </form>
      </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Wallets (click para ver movimientos)</h2>
          <input
            type="text"
            placeholder="Buscar wallets..."
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
          <p>Cargando...</p>
        ) : filteredCuentas.length === 0 ? (
          <p>No hay cuentas{searchTerm ? ' que coincidan con la búsqueda' : '. Crea una para comenzar.'}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Nombre{getSortIcon('name')}</th>
                <th onClick={() => handleSort('wallet_address')} style={{ cursor: 'pointer' }}>Wallet address{getSortIcon('wallet_address')}</th>
                <th onClick={() => handleSort('moneda')} style={{ cursor: 'pointer' }}>Moneda{getSortIcon('moneda')}</th>
                <th onClick={() => handleSort('balance')} style={{ cursor: 'pointer' }}>Balance{getSortIcon('balance')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCuentas.map((cuenta) => (
                <tr key={cuenta.id} onClick={() => navigate(`/movimientos/${empresaId}/${cuenta.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{cuenta.name}</td>
                  <td>
                    {cuenta.wallet_address}
                  </td>
                  <td>{coins.find(c => String(c.id) === cuenta.tipo) ? `${coins.find(c => String(c.id) === cuenta.tipo).name} ${coins.find(c => String(c.id) === cuenta.tipo).symbol} - ${coins.find(c => String(c.id) === cuenta.tipo).blockchain}` : cuenta.moneda}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {cuenta.moneda === 'USD' || cuenta.moneda === 'EUR' || cuenta.moneda === 'AED'
                      ? `${cuenta.moneda} ${cuenta.balance.toLocaleString()}`
                      : `${cuenta.balance} ${cuenta.moneda}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}