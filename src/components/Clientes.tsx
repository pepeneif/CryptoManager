import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Cliente {
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

export default function Clientes({ token }: Props) {
  const { empresaId } = useParams()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCliente, setNewCliente] = useState({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })

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
    fetchClientes()
  }, [empresaId])

  const fetchClientes = async () => {
    if (!empresaId) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId) return
    try {
      const response = await fetch(`/api/empresas/${empresaId}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCliente),
      })
      if (response.ok) {
        setNewCliente({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })
        fetchClientes()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const eliminarCliente = async (id: number) => {
    if (!confirm('¿Eliminar cliente?')) return
    try {
      await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchClientes()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const iniciarEdicion = (cliente: Cliente) => {
    setEditandoId(cliente.id)
    setEditData({
      name: cliente.name,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      direccion_fisica: cliente.direccion_fisica || '',
      datos_fiscales: cliente.datos_fiscales || '',
    })
  }

  const guardarEdicion = async (id: number) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      })
      if (response.ok) {
        setEditandoId(null)
        fetchClientes()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditData({ name: '', email: '', telefono: '', direccion: '', direccion_fisica: '', datos_fiscales: '' })
  }

  const filteredClientes = clientes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.telefono && c.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.direccion && c.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Sorting
  const sortedClientes = [...filteredClientes].sort((a, b) => {
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

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      {error && <div style={{ padding: '15px', background: '#fee2e2', color: '#dc2626', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Clientes</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showForm && (
            <button type="button" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 14px' }} onClick={() => setShowForm(true)}>
              + Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {showForm && (
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nuevo Cliente</h2>
        <form onSubmit={crearCliente}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <input type="text" value={newCliente.name} onChange={(e) => setNewCliente({ ...newCliente, name: e.target.value })} placeholder="Nombre" style={{ flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
            <input type="email" value={newCliente.email} onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })} placeholder="Email" style={{ flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            <input type="text" value={newCliente.telefono} onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })} placeholder="Teléfono" style={{ width: '150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <textarea value={newCliente.direccion_fisica} onChange={(e) => setNewCliente({ ...newCliente, direccion_fisica: e.target.value })} placeholder="Dirección física" style={{ flex: '2 1 300px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', minHeight: '60px', resize: 'vertical' }} />
            <textarea value={newCliente.datos_fiscales} onChange={(e) => setNewCliente({ ...newCliente, datos_fiscales: e.target.value })} placeholder="Datos fiscales (NIF, RFC, etc.)" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', minHeight: '60px', resize: 'vertical' }} />
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
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Clientes ({filteredClientes.length})</h2>
          <input
            type="text"
            placeholder="Buscar clientes..."
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
        {loading ? <p>Cargando...</p> : filteredClientes.length === 0 ? <p>No hay clientes{searchTerm ? ' que coincidan con la búsqueda' : '.'}</p> : (
          <table>
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Nombre{getSortIcon('name')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>Email{getSortIcon('email')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('telefono')}>Teléfono{getSortIcon('telefono')}</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedClientes.map((c) => (
                <tr key={c.id}>
                  {editandoId === c.id ? (
                    <>
                      <td><input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} /></td>
                      <td><input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} /></td>
                      <td><input type="text" value={editData.telefono} onChange={(e) => setEditData({ ...editData, telefono: e.target.value })} style={{ padding: '5px', width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} /></td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={() => guardarEdicion(c.id)}>Guardar</button>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={cancelarEdicion}>Cancelar</button>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', background: '#dc2626' }} onClick={() => eliminarCliente(c.id)}>Eliminar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{c.name}</td>
                      <td>{c.email || '-'}</td>
                      <td>{c.telefono || '-'}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', marginRight: '5px' }} onClick={() => iniciarEdicion(c)}>Editar</button>
                        <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }} onClick={() => eliminarCliente(c.id)}>Eliminar</button>
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