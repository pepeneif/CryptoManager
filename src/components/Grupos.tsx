import { useState, useEffect } from 'react'

interface Grupo {
  id: number
  nombre: string
  created_at: string
}

interface Props {
  token: string
}

export default function Grupos({ token }: Props) {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newGrupo, setNewGrupo] = useState('')

  useEffect(() => {
    fetchGrupos()
  }, [])

  const fetchGrupos = async () => {
    try {
      const response = await fetch('/api/admin/grupos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setGrupos(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearGrupo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: newGrupo }),
      })
      if (response.ok) {
        setNewGrupo('')
        setShowForm(false)
        fetchGrupos()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const eliminarGrupo = async (id: number) => {
    if (!confirm('¿Eliminar grupo?')) return
    try {
      await fetch(`/api/admin/grupos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchGrupos()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Grupos</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                fontSize: '0.9em'
              }}
            >
              + Nuevo Grupo
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nuevo Grupo</h2>
          <form onSubmit={crearGrupo}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                value={newGrupo}
                onChange={(e) => setNewGrupo(e.target.value)}
                placeholder="Nombre del grupo"
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
        <h2>Grupos ({grupos.length})</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : grupos.length === 0 ? (
          <p>No hay grupos. Crea uno para comenzar.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                style={{
                  padding: '15px',
                  background: 'var(--bg-input)',
                  borderRadius: '5px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{grupo.nombre}</span>
                <button 
                  onClick={() => eliminarGrupo(grupo.id)}
                  className="btn btn-secondary" 
                  style={{ padding: '5px 10px', fontSize: '0.8em', background: '#f44336' }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}