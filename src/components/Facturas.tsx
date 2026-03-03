import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Factura {
  id: number
  tipo: string
  cliente_id: number | null
  proveedor_id: number | null
  numero: string
  fecha: string
  fecha_vencimiento: string | null
  monto: number
  moneda: string
  estado: string
  descripcion: string
  cliente_nombre?: string
  proveedor_nombre?: string
}

interface FacturaItem {
  id?: number
  descripcion: string
  cantidad: number
  precio_unitario: number
  total: number
}

interface Props {
  token: string
}

const DEFAULT_CRIPTOS = [
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'SOL', name: 'Solana' },
  { id: 'USDT', name: 'Tether' },
  { id: 'USDC', name: 'USD Coin' },
  { id: 'BNB', name: 'Binance Coin' },
  { id: 'XRP', name: 'Ripple' },
  { id: 'ADA', name: 'Cardano' },
  { id: 'DOGE', name: 'Dogecoin' },
  { id: 'DOT', name: 'Polkadot' },
  { id: 'MATIC', name: 'Polygon' },
  { id: 'AVAX', name: 'Avalanche' },
  { id: 'LINK', name: 'Chainlink' },
  { id: 'UNI', name: 'Uniswap' },
  { id: 'ATOM', name: 'Cosmos' },
]

export default function Facturas({ token }: Props) {
  const { empresaId } = useParams()
  const navigate = useNavigate()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [criptos, setCriptos] = useState<{id: string, name: string}[]>(DEFAULT_CRIPTOS)
  const [items, setItems] = useState<FacturaItem[]>([{ descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }])
  const [newFactura, setNewFactura] = useState({
    tipo: 'purchase',
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    moneda: 'BTC',
    descripcion: ''
  })
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFacturas()
    fetchCriptos()
  }, [empresaId])

  const fetchCriptos = async () => {
    try {
      const response = await fetch('/api/admin/system-config', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.active_coins) {
          const activeCoins = JSON.parse(data.active_coins)
          const filtered = DEFAULT_CRIPTOS.filter(c => activeCoins.includes(c.id))
          if (filtered.length > 0) {
            setCriptos(filtered)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching config:', err)
    }
  }

  const fetchFacturas = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/facturas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setFacturas(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (index: number, field: keyof FacturaItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'descripcion') {
      newItems[index].descripcion = value as string
    } else {
      newItems[index][field] = Number(value) || 0
      newItems[index].total = newItems[index].cantidad * newItems[index].precio_unitario
    }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const crearFactura = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const total = getTotal()
    if (total <= 0) {
      alert('El total debe ser mayor a 0')
      return
    }

    const validItems = items.filter(i => i.descripcion.trim() !== '' && i.precio_unitario > 0)
    if (validItems.length === 0) {
      alert('Agrega al menos un item con descripción y precio')
      return
    }

    try {
      const response = await fetch(`/api/empresas/${empresaId}/facturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newFactura, monto: total }),
      })
      
      if (response.ok) {
        const factura = await response.json()
        
        // Create items
        for (const item of validItems) {
          await fetch(`/api/facturas/${factura.id}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario
            }),
          })
        }
        
        setNewFactura({ tipo: 'purchase', numero: '', fecha: new Date().toISOString().split('T')[0], moneda: 'BTC', descripcion: '' })
        setItems([{ descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }])
        setShowForm(false)
        fetchFacturas()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const cambiarEstado = async (id: number, estado: string) => {
    const factura = facturas.find(f => f.id === id)
    if (!factura) return
    
    try {
      await fetch(`/api/facturas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...factura, estado })
      })
      fetchFacturas()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const eliminarFactura = async (id: number) => {
    if (!confirm('¿Eliminar factura?')) return
    try {
      await fetch(`/api/facturas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchFacturas()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const totalPendiente = facturas.filter(f => f.estado === 'unpaid').reduce((sum, f) => sum + f.monto, 0)

  const filteredFacturas = facturas.filter(f =>
    f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.descripcion && f.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.cliente_nombre && f.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f.proveedor_nombre && f.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Facturas</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showForm && (
            <button type="button" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 14px' }} onClick={() => setShowForm(true)}>
              + Nueva Factura
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--bg-card)', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Total Pendiente: {totalPendiente.toLocaleString()} {facturas.length > 0 ? facturas[0].moneda : ''}</h2>
      </div>

      {showForm && (
      <div className="card" style={{ background: 'var(--bg-card)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nueva Factura</h2>
        <form onSubmit={crearFactura}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <select value={newFactura.tipo} onChange={(e) => setNewFactura({ ...newFactura, tipo: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              <option value="purchase">Compra</option>
              <option value="sales">Venta</option>
            </select>
            <input type="text" value={newFactura.numero} onChange={(e) => setNewFactura({ ...newFactura, numero: e.target.value })} placeholder="Número" style={{ width: '100px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
            <input type="date" value={newFactura.fecha} onChange={(e) => setNewFactura({ ...newFactura, fecha: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            <select value={newFactura.moneda} onChange={(e) => setNewFactura({ ...newFactura, moneda: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              {criptos.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Items</h3>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>Descripción</label>
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                    placeholder="Descripción del item"
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>Cantidad</label>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>Precio Unit.</label>
                  <input
                    type="number"
                    value={item.precio_unitario}
                    onChange={(e) => updateItem(index, 'precio_unitario', e.target.value)}
                    min="0"
                    step="0.00000001"
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>Total</label>
                  <div style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                    {item.total.toLocaleString()}
                  </div>
                </div>
                <button type="button" onClick={() => removeItem(index)} style={{ padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addItem} style={{ padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '5px' }}>+ Agregar Item</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.2em', color: 'var(--text-primary)' }}>
              <strong>Total: {getTotal().toLocaleString()} {newFactura.moneda}</strong>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }} onClick={() => { setShowForm(false); setItems([{ descripcion: '', cantidad: 1, precio_unitario: 0, total: 0 }]) }}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}>Crear</button>
            </div>
          </div>
        </form>
      </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Facturas ({filteredFacturas.length})</h2>
          <input
            type="text"
            placeholder="Buscar facturas..."
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
        {loading ? <p style={{ color: 'var(--text-primary)' }}>Cargando...</p> : filteredFacturas.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No hay facturas{searchTerm ? ' que coincidan con la búsqueda' : '.'}</p> : (
          <table>
            <thead>
              <tr><th style={{ color: 'var(--text-primary)' }}>Tipo</th><th style={{ color: 'var(--text-primary)' }}>Número</th><th style={{ color: 'var(--text-primary)' }}>Fecha</th><th style={{ color: 'var(--text-primary)' }}>Monto</th><th style={{ color: 'var(--text-primary)' }}>Estado</th><th style={{ color: 'var(--text-primary)' }}>Acciones</th></tr>
            </thead>
            <tbody>
              {filteredFacturas.map((f) => (
                <tr key={f.id}>
                  <td><span className="badge" style={{ background: f.tipo === 'sales' ? '#4caf50' : '#ff9800' }}>{f.tipo === 'sales' ? 'Venta' : 'Compra'}</span></td>
                  <td style={{ color: 'var(--text-primary)' }}>{f.numero}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{f.fecha}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{f.moneda} {f.monto.toLocaleString()}</td>
                  <td>
                    <span className="badge" style={{ background: f.estado === 'paid' ? '#4caf50' : '#f44336' }}>
                      {f.estado === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    {f.estado === 'unpaid' && (
                      <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={() => cambiarEstado(f.id, 'paid')}>Pagar</button>
                    )}
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }} onClick={() => eliminarFactura(f.id)}>Eliminar</button>
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
