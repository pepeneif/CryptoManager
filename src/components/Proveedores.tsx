import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Proveedor {
  id: number
  name: string
  email: string
  telefono: string
  direccion: string
  direccion_fisica: string
  datos_fiscales: string
}

interface Props {
  token: string
}

export default function Proveedores({ token }: Props) {
  const { empresaId } = useParams()
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newProveedor, setNewProveedor] = useState({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })

  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editData, setEditData] = useState({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })
  
  // Sorting
  type SortField = 'name' | 'email' | 'telefono' | 'direccion'
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>('default')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') { setSortDirection('default'); setSortField('name') }
      else setSortDirection('asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return ''
    if (sortDirection === 'asc') return ' ↑'
    if (sortDirection === 'desc') return ' ↓'
    return ''
  }

  // Guard: redirect if empresaId is missing
  useEffect(() => {
    if (!empresaId) {
      setError('Empresa no encontrada. Selecciona una empresa desde el dashboard.')
      setLoading(false)
      return
    }
    setError(null)
    fetchProveedores()
  }, [empresaId])

  const fetchProveedores = async () => {
    if (!empresaId) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/proveedores`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setProveedores(data)
      } else {
        const errData = await response.json()
        setError(errData.error || 'Error al cargar proveedores')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const crearProveedor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId) {
      setError('Empresa no seleccionada')
      return
    }
    try {
      const response = await fetch(`/api/empresas/${empresaId}/proveedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProveedor),
      })
      if (response.ok) {
        setNewProveedor({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })
        setShowForm(false)
        fetchProveedores()
      } else {
        const errData = await response.json()
        setError(errData.error || 'Error al crear proveedor')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión')
    }
  }

  const eliminarProveedor = async (id: number) => {
    if (!empresaId) {
      setError('Empresa no seleccionada')
      return
    }
    if (!confirm('¿Eliminar proveedor?')) return
    try {
      const response = await fetch(`/api/proveedores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        fetchProveedores()
      } else {
        const errData = await response.json()
        setError(errData.error || 'Error al eliminar proveedor')
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const iniciarEdicion = (proveedor: Proveedor) => {
    setEditandoId(proveedor.id)
    setEditData({
      name: proveedor.name,
      email: proveedor.email || '',
      telefono: proveedor.telefono || '',
      direccion: proveedor.direccion || '',
      direccion_fisica: proveedor.direccion_fisica || '',
      datos_fiscales: proveedor.datos_fiscales || '',
    })
  }

  const guardarEdicion = async (id: number) => {
    try {
      const response = await fetch(`/api/proveedores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      })
      if (response.ok) {
        setEditandoId(null)
        fetchProveedores()
      } else {
        const errData = await response.json()
        setError(errData.error || 'Error al actualizar proveedor')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión')
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditData({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })
  }

  const filteredProveedores = proveedores.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.telefono && p.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.direccion && p.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Sorting
  const sortedProveedores = [...filteredProveedores].sort((a, b) => {
    if (sortDirection === 'default') {
      return a.name.localeCompare(b.name)
    }
    const direction = sortDirection === 'desc' ? -1 : 1
    switch (sortField) {
      case 'name': return direction * a.name.localeCompare(b.name)
      case 'email': return direction * (a.email || '').localeCompare(b.email || '')
      case 'telefono': return direction * (a.telefono || '').localeCompare(b.telefono || '')
      case 'direccion': return direction * (a.direccion || '').localeCompare(b.direccion || '')
      default: return 0
    }
  })

  if (error && !proveedores.length) {
    return (
      <div className="dashboard" style={{ padding: '20px' }}>
        <div className="card" style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Error</h3>
          <p style={{ margin: 0, color: '#7f1d1d' }}>{error}</p>
          <button 
            onClick={() => navigate('/')} 
            style={{ marginTop: '15px', padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Proveedores</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showForm && (
            <button type="button" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 14px' }} onClick={() => setShowForm(true)}>
              + Nuevo Proveedor
            </button>
          )}
        </div>
      </div>

      {showForm && (
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nuevo Proveedor</h2>
        <form onSubmit={crearProveedor}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <input type="text" value={newProveedor.name} onChange={(e) => setNewProveedor({ ...newProveedor, name: e.target.value })} placeholder="Nombre" style={{ flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
            <input type="email" value={newProveedor.email} onChange={(e) => setNewProveedor({ ...newProveedor, email: e.target.value })} placeholder="Email" style={{ flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            <input type="text" value={newProveedor.telefono} onChange={(e) => setNewProveedor({ ...newProveedor, telefono: e.target.value })} placeholder="Teléfono" style={{ width: '150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <textarea value={newProveedor.direccion_fisica} onChange={(e) => setNewProveedor({ ...newProveedor, direccion_fisica: e.target.value })} placeholder="Dirección física" style={{ flex: '2 1 300px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', minHeight: '60px', resize: 'vertical' }} />
            <textarea value={newProveedor.datos_fiscales} onChange={(e) => setNewProveedor({ ...newProveedor, datos_fiscales: e.target.value })} placeholder="Datos fiscales (NIF, RFC, etc.)" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', minHeight: '60px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }} onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}>Crear</button>
          </div>
        </form>
      </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Proveedores ({filteredProveedores.length})</h2>
          <input
            type="text"
            placeholder="Buscar proveedores..."
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
        {loading ? <p>Cargando...</p> : filteredProveedores.length === 0 ? <p>No hay proveedores{searchTerm ? ' que coincidan con la búsqueda' : '.'}</p> : (
          <table>
            <thead>
              <tr>
                <th style={{ color: '#4a90d9', cursor: 'pointer' }} onClick={() => handleSort('name')}>Nombre{getSortIcon('name')}</th>
                <th style={{ color: '#4a90d9', cursor: 'pointer' }} onClick={() => handleSort('email')}>Email{getSortIcon('email')}</th>
                <th style={{ color: '#4a90d9', cursor: 'pointer' }} onClick={() => handleSort('telefono')}>Teléfono{getSortIcon('telefono')}</th>
                <th style={{ color: '#4a90d9' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedProveedores.map((p) => (
                <tr key={p.id}>
                  {editandoId === p.id ? (
                    <>
                      <td><input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} /></td>
                      <td><input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} /></td>
                      <td><input type="text" value={editData.telefono} onChange={(e) => setEditData({ ...editData, telefono: e.target.value })} style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} /></td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={() => guardarEdicion(p.id)}>Guardar</button>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={cancelarEdicion}>Cancelar</button>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', background: '#dc2626' }} onClick={() => eliminarProveedor(p.id)}>Eliminar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{p.name}</td>
                      <td>{p.email || '-'}</td>
                      <td>{p.telefono || '-'}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={() => iniciarEdicion(p)}>Editar</button>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }} onClick={() => eliminarProveedor(p.id)}>Eliminar</button>
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