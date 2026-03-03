import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Empresa {
  id: number
  name: string
  created_at: string
}

interface DashboardProps {
  token: string
  onLogout: () => void
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newEmpresa, setNewEmpresa] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchEmpresas()
  }, [])

  const fetchEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // Sort alphabetically
        const sorted = data.sort((a: Empresa, b: Empresa) => a.name.localeCompare(b.name))
        setEmpresas(sorted)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newEmpresa }),
      })
      if (response.ok) {
        setNewEmpresa('')
        setShowForm(false)
        fetchEmpresas()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>CryptoManager</h1>
        <button className="btn btn-secondary" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </div>

      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 16px',
            background: '#4a90d9',
            border: 'none',
            borderRadius: '5px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '0.9em'
          }}
        >
          + Nueva Empresa
        </button>
      )}

      {showForm && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nueva Empresa</h2>
          <form onSubmit={crearEmpresa}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                value={newEmpresa}
                onChange={(e) => setNewEmpresa(e.target.value)}
                placeholder="Nombre de la empresa"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}>
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2>Empresas</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : empresas.length === 0 ? (
          <p>No hay empresas. Crea una para comenzar.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {empresas.map((empresa) => (
              <div
                key={empresa.id}
                onClick={() => navigate(`/cuentas/${empresa.id}`)}
                style={{
                  padding: '15px',
                  background: 'var(--bg-input)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{empresa.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Abrir →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}