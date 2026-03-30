import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
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
  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

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
          padding: '10px 5px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.8em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {collapsed ? '' : 'administrator'}
          {!collapsed && (
            <div style={{ marginTop: '10px', width: '100%', padding: '0 5px', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%' }}>
                {(() => {
                  if (!isConnected) {
                    return (
                      <button 
                        onClick={() => open()} 
                        type="button"
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          background: 'var(--bg-primary, #fff)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-color, #e0e0e0)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', gap: '8px', maxWidth: '100%' }}>
                      <button
                        onClick={() => open({ view: 'Networks' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          background: 'var(--bg-primary, #fff)',
                          border: '1px solid var(--border-color, #e0e0e0)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)'
                        }}
                        type="button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => open()}
                        type="button"
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-primary, #fff)',
                          border: '1px solid var(--border-color, #e0e0e0)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          fontSize: '13px'
                        }}
                      >
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
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