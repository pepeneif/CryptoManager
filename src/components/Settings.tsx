import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { t, subscribeToLanguageChanges, loadLanguageFromConfig } from '../i18n'
import ThemeToggle from './ThemeToggle'

interface Props {
  token: string
}

export default function Settings({ token }: Props) {
  const navigate = useNavigate()
  const { empresaId } = useParams()
  const [, forceUpdate] = useState(0)

  // Subscribe to language changes
  useEffect(() => {
    const unsubscribe = subscribeToLanguageChanges(() => {
      forceUpdate(n => n + 1)
    })
    return () => { unsubscribe() }
  }, [])

  // Load language from config on mount
  useEffect(() => {
    loadLanguageFromConfig(token)
  }, [token])

  const menuItems = [
    { key: 'companyData', path: `/datos-empresa/${empresaId}` },
    { key: 'users', path: `/usuarios/${empresaId}` },
    { key: 'groups', path: `/grupos/${empresaId}` },
    { key: 'coins', path: `/coins-tokens/${empresaId}` },
    { key: 'references', path: `/referencias/${empresaId}` },
  ]

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('settings.title')}</h1>
        <ThemeToggle />
      </div>

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{t('settings.config')}</h2>
        
        {menuItems.map((item) => (
          <div 
            key={item.key}
            onClick={() => navigate(item.path)}
            style={{ 
              padding: '15px', 
              background: 'var(--bg-input)', 
              borderRadius: '5px', 
              marginBottom: '10px', 
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{t(`settings.${item.key}`)}</span>
            <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0', fontSize: '0.9em' }}>{t(`settings.${item.key}.desc`)}</p>
          </div>
        ))}

      </div>
    </div>
  )
}
