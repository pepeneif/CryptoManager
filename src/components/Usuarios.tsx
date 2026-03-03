import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Usuario {
  id: number
  username: string
  name: string
  email: string
  role: string
  enabled: number
  grupo_id: number | null
  created_at: string
}

interface Grupo {
  id: number
  nombre: string
}

interface Props {
  token: string
}

export default function Usuarios({ token }: Props) {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<{id: number, username: string, name: string, email: string, role: string, enabled: number, grupo_id: string} | null>(null)
  const [newUsuario, setNewUsuario] = useState({ name: '', username: '', email: '', password: '', role: 'user', grupo_id: '' })

  useEffect(() => {
    fetchUsuarios()
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
    }
  }

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUsuario),
      })
      if (response.ok) {
        setNewUsuario({ name: '', username: '', email: '', password: '', role: 'user', grupo_id: '' })
        setShowForm(false)
        fetchUsuarios()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al crear usuario')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error al crear usuario')
    }
  }

  const actualizarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    
    try {
      const response = await fetch(`/api/admin/usuarios/${editando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editando.username,
          name: editando.name,
          email: editando.email,
          role: editando.role,
          enabled: editando.enabled
        }),
      })
      if (response.ok) {
        setEditando(null)
        fetchUsuarios()
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const eliminarUsuario = async (id: number) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      await fetch(`/api/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchUsuarios()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const toggleUsuario = async (id: number) => {
    try {
      await fetch(`/api/admin/usuarios/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchUsuarios()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Usuarios</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!showForm && !editando && (
            <button type="button" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 14px' }} onClick={() => setShowForm(true)}>
              + Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nuevo Usuario</h2>
          <form onSubmit={crearUsuario}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <input type="text" value={newUsuario.name} onChange={(e) => setNewUsuario({ ...newUsuario, name: e.target.value })} placeholder="Nombre real" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              <input type="text" value={newUsuario.username} onChange={(e) => setNewUsuario({ ...newUsuario, username: e.target.value })} placeholder="Usuario" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
              <input type="email" value={newUsuario.email} onChange={(e) => setNewUsuario({ ...newUsuario, email: e.target.value })} placeholder="Email" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              <input type="password" value={newUsuario.password} onChange={(e) => setNewUsuario({ ...newUsuario, password: e.target.value })} placeholder="Contraseña" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
              <select value={newUsuario.role} onChange={(e) => setNewUsuario({ ...newUsuario, role: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <select value={newUsuario.grupo_id} onChange={(e) => setNewUsuario({ ...newUsuario, grupo_id: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="">Sin grupo</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }} onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}>Crear</button>
            </div>
          </form>
        </div>
      )}

      {editando && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Editar Usuario</h2>
          <form onSubmit={actualizarUsuario}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <input type="text" value={editando.username} onChange={(e) => setEditando({ ...editando, username: e.target.value })} placeholder="Usuario" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} required />
              <input type="text" value={editando.name || ''} onChange={(e) => setEditando({ ...editando, name: e.target.value })} placeholder="Nombre real" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              <input type="email" value={editando.email || ''} onChange={(e) => setEditando({ ...editando, email: e.target.value })} placeholder="Email" style={{ flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              <select value={editando.role} onChange={(e) => setEditando({ ...editando, role: e.target.value })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <select value={editando.enabled} onChange={(e) => setEditando({ ...editando, enabled: parseInt(e.target.value) })} style={{ padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value={1}>Habilitado</option>
                <option value={0}>Deshabilitado</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.9em', padding: '8px 16px', width: 'auto' }} onClick={() => setEditando(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }}>Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2>Usuarios ({usuarios.length})</h2>
        {loading ? <p>Cargando...</p> : usuarios.length === 0 ? <p>No hay usuarios.</p> : (
          <table>
            <thead>
              <tr><th>Nombre</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Grupo</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const grupoNombre = grupos.find(g => g.id === u.grupo_id)?.nombre || '-'
                return (
                <tr key={u.id}>
                  <td>{u.name || '-'}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td><span className="badge" style={{ background: u.role === 'admin' ? '#9c27b0' : '#4a90d9' }}>{u.role === 'admin' ? 'Admin' : 'Usuario'}</span></td>
                  <td>{grupoNombre}</td>
                  <td>
                    <span className="badge" style={{ background: u.enabled ? '#4caf50' : '#f44336' }}>
                      {u.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }} onClick={() => setEditando({ id: u.id, username: u.username, name: u.name || '', email: u.email || '', role: u.role, enabled: u.enabled, grupo_id: String(u.grupo_id || '') })}>Editar</button>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em' }} onClick={() => toggleUsuario(u.id)}>
                      {u.enabled ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8em', background: '#f44336' }} onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}