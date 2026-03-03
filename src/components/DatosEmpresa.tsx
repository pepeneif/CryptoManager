import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

interface EmpresaDatos {
  id: number
  empresa_id: number
  nombre: string
  nombre_comercial: string
  identificacion_fiscal: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  pais: string
  codigo_postal: string
  website: string
  logo_url: string
}

interface Props {
  token: string
}

export default function DatosEmpresa({ token }: Props) {
  const { empresaId } = useParams()
  const [datos, setDatos] = useState<EmpresaDatos | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    nombre_comercial: '',
    identificacion_fiscal: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    pais: '',
    codigo_postal: '',
    website: '',
    logo_url: ''
  })

  useEffect(() => {
    fetchDatos()
  }, [empresaId])

  const fetchDatos = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}/datos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDatos(data)
        setFormData({
          nombre: data.nombre || '',
          nombre_comercial: data.nombre_comercial || '',
          identificacion_fiscal: data.identificacion_fiscal || '',
          telefono: data.telefono || '',
          email: data.email || '',
          direccion: data.direccion || '',
          ciudad: data.ciudad || '',
          pais: data.pais || '',
          codigo_postal: data.codigo_postal || '',
          website: data.website || '',
          logo_url: data.logo_url || ''
        })
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMensaje('')
    
    try {
      const response = await fetch(`/api/empresas/${empresaId}/datos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const data = await response.json()
        setDatos(data)
        setMensaje('Datos guardados correctamente')
        setTimeout(() => setMensaje(''), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setMensaje('Error al guardar datos')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard" style={{ padding: '20px' }}>
        <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ margin: 0 }}>Datos de la Empresa</h1>
        </div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Datos de la Empresa</h1>
      </div>

      {mensaje && (
        <div className="card" style={{ background: mensaje.includes('Error') ? '#431b1b' : '#1b4332', color: mensaje.includes('Error') ? '#f44336' : '#4caf50', marginBottom: '20px' }}>
          {mensaje}
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <form onSubmit={guardarDatos}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Nombre Legal</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Nombre Comercial</label>
              <input type="text" value={formData.nombre_comercial} onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Identificación Fiscal (NIF, RFC, VAT)</label>
              <input type="text" value={formData.identificacion_fiscal} onChange={(e) => setFormData({ ...formData, identificacion_fiscal: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Teléfono</label>
              <input type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Website</label>
              <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Dirección</label>
              <input type="text" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Ciudad</label>
              <input type="text" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>País</label>
              <input type="text" value={formData.pais} onChange={(e) => setFormData({ ...formData, pais: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Código Postal</label>
              <input type="text" value={formData.codigo_postal} onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>URL del Logo</label>
              <input type="text" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
              {formData.logo_url && (
                <div style={{ marginTop: '10px' }}>
                  <img src={formData.logo_url} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.9em', padding: '8px 20px', width: 'auto' }} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}