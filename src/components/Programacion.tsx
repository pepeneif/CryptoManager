import { useParams } from 'react-router-dom'

interface Props {
  token: string
}

export default function Programacion({ token }: Props) {
  const { empresaId } = useParams()

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Autorizaciones</h1>
      </div>

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2>Autorizaciones</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Sección de autorizaciones en desarrollo...</p>
      </div>
    </div>
  )
}