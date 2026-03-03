import { useState, useEffect } from 'react'

interface ThemeToggleProps {
  onThemeChange?: (theme: 'dark' | 'light') => void
}

export default function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light'
    if (saved) {
      setTheme(saved)
      document.body.setAttribute('data-theme', saved)
      onThemeChange?.(saved)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.setAttribute('data-theme', newTheme)
    onThemeChange?.(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 16px',
        background: theme === 'dark' ? '#4a90d9' : '#666666',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.9em'
      }}
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}