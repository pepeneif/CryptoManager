import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
  token: string
}

export default function Layout({ children, token }: LayoutProps) {
  const { empresaId } = useParams()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  // Only show empresa-specific menu items if empresaId is available
  const menuItems = empresaId ? [
    { path: `/cuentas/${empresaId}`, label: 'Wallets', icon: '1.' },
    { path: `/clientes/${empresaId}`, label: 'Clientes', icon: '2.' },
    { path: `/proveedores/${empresaId}`, label: 'Proveedores', icon: '3.' },
    { path: `/facturas/${empresaId}`, label: 'Facturas', icon: '4.' },
    { path: `/pagos/${empresaId}`, label: 'Pagos', icon: '5.' },
    { path: `/tasks/${empresaId}`, label: 'Tasks', icon: '6.' },
    { path: `/reportes/${empresaId}`, label: 'Reportes', icon: '7.' },
  ] : []

  const bottomMenuItems = [
    { path: `/settings/${empresaId || ''}`, label: 'Configuracion', icon: '0.' },
  ]

  const currentPath = window.location.pathname

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{
        width: collapsed ? '60px' : '200px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        transition: 'width 0.2s',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        {/* Logo/Title */}
        <div style={{
          padding: '15px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          {!collapsed && <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>CryptoManager</span>}
          <button 
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed) }}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '0.9em', fontWeight: 'bold'
            }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {menuItems.map((item) => {
            const isActive = currentPath === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: collapsed ? '12px' : '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isActive ? 'var(--bg-selected)' : 'transparent',
                  borderLeft: isActive ? '3px solid #4a90d9' : '3px solid transparent',
                  color: isActive ? 'var(--text-primary)' : '#888',
                  transition: 'all 0.2s',
                  justifyContent: collapsed ? 'center' : 'flex-start'
                }}
              >
                <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            )
          })}
        </nav>

        {/* Bottom Menu Items */}
        <nav style={{ padding: '10px 0' }}>
          {bottomMenuItems.map((item) => {
            const isActive = currentPath === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: collapsed ? '12px' : '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isActive ? 'var(--bg-selected)' : 'transparent',
                  borderLeft: isActive ? '3px solid #4a90d9' : '3px solid transparent',
                  color: isActive ? 'var(--text-primary)' : '#888',
                  transition: 'all 0.2s',
                  justifyContent: collapsed ? 'center' : 'flex-start'
                }}
              >
                <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            )
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '15px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.8em'
        }}>
          {collapsed ? '' : 'administrator'}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: collapsed ? '60px' : '200px',
        flex: 1,
        transition: 'margin-left 0.2s',
        padding: '20px'
      }}>
        {children}
      </div>
    </div>
  )
}