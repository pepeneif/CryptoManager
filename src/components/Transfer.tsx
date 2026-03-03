import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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

export default function Transfer({ token }: Props) {
  const { empresaId, cuentaId } = useParams()
  const navigate = useNavigate()
  const [cuentas, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [transfer, setTransfer] = useState({
    cuenta_origen_id: cuentaId || '',
    cuenta_destino_id: '',
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  })
  const [message, setMessage] = useState('')

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

  const hacerTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    
    try {
      const response = await fetch(`/api/empresas/${empresaId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transfer),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ Transferencia exitosa: $${transfer.monto} de ${data.origen} a ${data.destino}`)
        setTransfer({
          cuenta_origen_id: cuentaId || '',
          cuenta_destino_id: '',
          monto: 0,
          descripcion: '',
          fecha: new Date().toISOString().split('T')[0]
        })
        setTimeout(() => {
          navigate(`/movimientos/${empresaId}/${cuentaId}`)
        }, 2000)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage('❌ Error al realizar transferencia')
    }
  }

  const cuentaOrigen = cuentas.find(c => c.id === parseInt(transfer.cuenta_origen_id))
  const cuentaDestino = cuentas.find(c => c.id === parseInt(transfer.cuenta_destino_id))

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Transferencia</h1>
      </div>

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <form onSubmit={hacerTransfer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Wallet Origen</label>
              <select 
                value={transfer.cuenta_origen_id} 
                onChange={(e) => setTransfer({ ...transfer, cuenta_origen_id: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                required
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.moneda} {c.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div style={{ textAlign: 'center', color: '#ff9800', fontSize: '2em' }}>↓</div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Wallet Destino</label>
              <select 
                value={transfer.cuenta_destino_id} 
                onChange={(e) => setTransfer({ ...transfer, cuenta_destino_id: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                required
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.moneda} {c.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Monto</label>
                <input 
                  type="number" 
                  value={transfer.monto} 
                  onChange={(e) => setTransfer({ ...transfer, monto: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  required
                  min="1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Fecha</label>
                <input 
                  type="date" 
                  value={transfer.fecha} 
                  onChange={(e) => setTransfer({ ...transfer, fecha: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Descripción (opcional)</label>
              <input 
                type="text" 
                value={transfer.descripcion} 
                onChange={(e) => setTransfer({ ...transfer, descripcion: e.target.value })}
                placeholder="Descripción de la transferencia"
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              />
            </div>

            {message && (
              <div style={{ padding: '15px', borderRadius: '5px', background: message.includes('✅') ? '#1b4332' : '#431b1b', color: message.includes('✅') ? '#4caf50' : '#f44336' }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#ff9800' }}>
                Realizar Transferencia
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/movimientos/${empresaId}/${cuentaId}`)}>
                Cancelar
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}