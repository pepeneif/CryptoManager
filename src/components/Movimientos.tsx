import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Movimiento {
  id: number
  cuenta_id: number
  tipo: string
  monto: number
  moneda: string
  descripcion: string
  fecha: string
  referencia: string
  cuenta_nombre?: string
}

interface Wallet {
  id: number
  name: string
  tipo: string
  moneda: string
  balance: number
}

interface Props {
  token: string
}

export default function Movimientos({ token }: Props) {
  const { empresaId, cuentaId } = useParams()
  const navigate = useNavigate()
  const [cuenta, setWallet] = useState<Wallet | null>(null)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newMovimiento, setNewMovimiento] = useState({
    tipo: 'debit',
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    referencia: ''
  })

  useEffect(() => {
    fetchWallet()
    fetchMovimientos()
  }, [cuentaId])

  const fetchWallet = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/cuentas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const c = data.find((x: Wallet) => x.id === parseInt(cuentaId || '0'))
        if (c) setWallet(c)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const fetchMovimientos = async () => {
    try {
      const response = await fetch(`/api/cuentas/${cuentaId}/movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMovimientos(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearMovimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/cuentas/${cuentaId}/movimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMovimiento),
      })
      if (response.ok) {
        setNewMovimiento({
          tipo: 'debit',
          monto: 0,
          descripcion: '',
          fecha: new Date().toISOString().split('T')[0],
          referencia: ''
        })
        setShowForm(false)
        fetchWallet()
        fetchMovimientos()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const eliminarMovimiento = async (id: number) => {
    if (!confirm('¿Eliminar movimiento? Esto revertirá el balance.')) return
    try {
      await fetch(`/api/movimientos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchWallet()
      fetchMovimientos()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const totalIngresos = movimientos.filter(m => m.tipo === 'credit').reduce((sum, m) => sum + m.monto, 0)
  const totalEgresos = movimientos.filter(m => m.tipo === 'debit').reduce((sum, m) => sum + m.monto, 0)

  return (
    <div className="dashboard">
      <div className="header">
        <h1>{cuenta?.name || 'Movimientos'}</h1>
      </div>

      {cuenta && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>{cuenta.moneda} {cuenta.balance.toLocaleString()}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Balance actual</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ background: '#4caf50', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px', minHeight: '70px', lineHeight: 1.2 }} onClick={() => { setNewMovimiento({ ...newMovimiento, tipo: 'credit' }); setShowForm(true) }}>
                <span style={{ fontSize: '1.4em', fontWeight: 'bold' }}>+</span>
                <span>Receive</span>
              </button>
              <button className="btn btn-primary" style={{ background: '#f44336', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px', minHeight: '70px', lineHeight: 1.2 }} onClick={() => { setNewMovimiento({ ...newMovimiento, tipo: 'debit' }); setShowForm(true) }}>
                <span style={{ fontSize: '1.4em', fontWeight: 'bold' }}>−</span>
                <span>Spend</span>
              </button>
              <button className="btn btn-primary" style={{ background: '#ff9800', padding: '12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '90px', minHeight: '70px', lineHeight: 1.2 }} onClick={() => navigate(`/transferir/${empresaId}/${cuentaId}`)}>
                <span style={{ fontSize: '1.4em', fontWeight: 'bold' }}>↔</span>
                <span>Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h3>{newMovimiento.tipo === 'credit' ? 'Recibir dinero' : 'Gastar dinero'}</h3>
          <form onSubmit={crearMovimiento} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Tipo</label>
              <select value={newMovimiento.tipo} onChange={(e) => setNewMovimiento({ ...newMovimiento, tipo: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="credit">Receive (Ingreso)</option>
                <option value="debit">Spend (Egreso)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Monto</label>
              <input type="number" value={newMovimiento.monto} onChange={(e) => setNewMovimiento({ ...newMovimiento, monto: parseFloat(e.target.value) || 0 })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', width: '120px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Fecha</label>
              <input type="date" value={newMovimiento.fecha} onChange={(e) => setNewMovimiento({ ...newMovimiento, fecha: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Descripción</label>
              <input type="text" value={newMovimiento.descripcion} onChange={(e) => setNewMovimiento({ ...newMovimiento, descripcion: e.target.value })} placeholder="Descripción" style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', width: '200px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Guardar</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </form>
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2>Movimientos ({movimientos.length})</h2>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#4caf50' }}>Ingresos: +{totalIngresos.toLocaleString()}</div>
            <div style={{ color: '#f44336' }}>Egresos: -{totalEgresos.toLocaleString()}</div>
          </div>
        </div>
        
        {loading ? <p>Cargando...</p> : movimientos.length === 0 ? <p>No hay movimientos.</p> : (
          <table>
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Referencia</th><th>Monto</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{m.fecha}</td>
                  <td>
                    <span className="badge" style={{ background: m.tipo === 'credit' ? '#4caf50' : '#f44336' }}>
                      {m.tipo === 'credit' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td>{m.descripcion || '-'}</td>
                  <td>{m.referencia || '-'}</td>
                  <td style={{ fontWeight: 'bold', color: m.tipo === 'credit' ? '#4caf50' : '#f44336' }}>
                    {m.tipo === 'credit' ? '+' : '-'}{m.moneda} {m.monto.toLocaleString()}
                  </td>
                  <td><button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }} onClick={() => eliminarMovimiento(m.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}