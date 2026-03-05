import { useState, useEffect, useRef } from 'react'
import { setLanguage, subscribeToLanguageChanges, getAvailableLanguages, getLanguage } from '../i18n'

interface Props {
  token: string
}

// Currency suggestions for the base currency input
const CURRENCY_SUGGESTIONS = [
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Yen japonés' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'ETH', name: 'Ethereum' },
  { code: 'SOL', name: 'Solana' },
]



const FIAT_CURRENCIES = [
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'EUR', name: 'Euro' },
  { code: 'AED', name: 'Dirham de los EAU' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'JPY', name: 'Yen japonés' },
  { code: 'CNY', name: 'Yuan chino' },
  { code: 'CHF', name: 'Franco suizo' },
  { code: 'CAD', name: 'Dólar canadiense' },
  { code: 'AUD', name: 'Dólar australiano' },
  { code: 'BRL', name: 'Real brasileño' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'KRW', name: 'Won surcoreano' },
  { code: 'INR', name: 'Rupia india' },
  { code: 'RUB', name: 'Rublo ruso' },
  { code: 'SAR', name: 'Riyal saudí' },
]

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
}

const EXCHANGE_SOURCES = [
  { id: 'coingecko', name: 'CoinGecko' },
  { id: 'coinmarketcap', name: 'CoinMarketCap' },
  { id: 'xe', name: 'XE.com' },
  { id: 'exchangerate', name: 'ExchangeRate-API' },
  { id: 'openexchangerates', name: 'Open Exchange Rates' },
  { id: 'fixer', name: 'Fixer.io' },
]

const SYSTEM_LANGUAGES = [
  { id: 'es', name: 'Español' },
  { id: 'en', name: 'Inglés' },
  { id: 'zh', name: 'Chino' },
  { id: 'ja', name: 'Japonés' },
  { id: 'ko', name: 'Coreano' },
]

export default function Referencias({ token }: Props) {
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [exchangeSource, setExchangeSource] = useState('coingecko')
  const [systemLanguage, setSystemLanguage] = useState('es')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState(CURRENCY_SUGGESTIONS)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/system-config', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.base_currency) setBaseCurrency(data.base_currency)
        if (data.exchange_rate_source) setExchangeSource(data.exchange_rate_source)
        if (data.system_language) setSystemLanguage(data.system_language)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter suggestions based on input
  const handleCurrencyInputChange = (value: string) => {
    setBaseCurrency(value.toUpperCase())
    const filtered = CURRENCY_SUGGESTIONS.filter(
      c => c.code.toLowerCase().includes(value.toLowerCase()) || 
           c.name.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredSuggestions(filtered.length > 0 ? filtered : CURRENCY_SUGGESTIONS)
    setShowSuggestions(true)
  }

  const selectSuggestion = (code: string) => {
    setBaseCurrency(code)
    setShowSuggestions(false)
  }

  // Validate currency with CoinGecko
  const validateCurrencyWithCoinGecko = async (currency: string): Promise<boolean> => {
    // Check if it's a known crypto
    const cryptoId = CRYPTO_IDS[currency.toUpperCase()]
    if (cryptoId) {
      // It's a crypto - validate with CoinGecko using /coins endpoint
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&community_data=false&developer_data=false`
        )
        return response.ok
      } catch {
        return false
      }
    }
    
    // Check if it's a known fiat currency
    const isFiat = FIAT_CURRENCIES.some(c => c.code === currency)
    if (isFiat) return true
    
    // Unknown currency
    return false
  }

  const saveConfig = async () => {
    setSaving(true)
    setValidating(true)
    setMessage('')
    
    try {
      // Validate currency with CoinGecko
      const isValid = await validateCurrencyWithCoinGecko(baseCurrency)
      
      if (!isValid) {
        setMessage('Error: La moneda no es válida o no se encontró en CoinGecko')
        setSaving(false)
        setValidating(false)
        return
      }

      const response = await fetch('/api/admin/system-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          configs: {
            base_currency: baseCurrency,
            exchange_rate_source: exchangeSource,
            system_language: systemLanguage,
          },
        }),
      })
      if (response.ok) {
        setMessage('Configuración guardada correctamente')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage('Error al guardar configuración')
    } finally {
      setSaving(false)
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard" style={{ padding: '20px' }}>
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-primary)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Preferencias</h1>
      </div>

      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <h2 style={{ color: 'var(--text-primary)', marginTop: 0 }}>Configuración de Preferencias</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Configura la moneda base y la fuente de tipos de cambio
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Moneda Base - Text Input with Suggestions */}
          <div style={{ position: 'relative' }}>
            <label
              htmlFor="baseCurrency"
              style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 'bold' }}
            >
              Moneda Base
            </label>
            <input
              ref={inputRef}
              id="baseCurrency"
              type="text"
              value={baseCurrency}
              onChange={(e) => handleCurrencyInputChange(e.target.value)}
              onFocus={() => {
                setFilteredSuggestions(CURRENCY_SUGGESTIONS)
                setShowSuggestions(true)
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Ej: USD, EUR, BTC..."
              autoComplete="off"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '1em',
              }}
            />
            {showSuggestions && (
              <ul
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxWidth: '400px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '5px',
                  margin: '4px 0 0 0',
                  padding: 0,
                  listStyle: 'none',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                }}
              >
                {filteredSuggestions.map((currency) => (
                  <li
                    key={currency.code}
                    onClick={() => selectSuggestion(currency.code)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <strong>{currency.code}</strong> - {currency.name}
                  </li>
                ))}
              </ul>
            )}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em', marginTop: '5px' }}>
              Moneda principal para valores y reportes. Sugerencias: USD, EUR, JPY, GBP, BTC, ETH, SOL
            </p>
          </div>

          {/* Fuente de Tipos de Cambio */}
          <div>
            <label
              htmlFor="exchangeSource"
              style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 'bold' }}
            >
              Fuente de Tipos de Cambio
            </label>
            <select
              id="exchangeSource"
              value={exchangeSource}
              onChange={(e) => setExchangeSource(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '1em',
              }}
            >
              {EXCHANGE_SOURCES.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em', marginTop: '5px' }}>
              Proveedor de datos para tasas de cambio de criptomonedas
            </p>
          </div>

          {/* Idioma del Sistema */}
          <div>
            <label
              htmlFor="systemLanguage"
              style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 'bold' }}
            >
              Idioma del sistema
            </label>
            <select
              id="systemLanguage"
              value={systemLanguage}
              onChange={(e) => {
                setSystemLanguage(e.target.value)
                setLanguage(e.target.value)
              }}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '1em',
              }}
            >
              {SYSTEM_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85em', marginTop: '5px' }}>
              Idioma de la interfaz de usuario
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
          <button
            onClick={saveConfig}
            disabled={saving || validating}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            {validating ? 'Validando...' : saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          {message && (
            <span style={{ color: message.includes('Error') ? 'var(--color-error, #e74c3c)' : 'var(--color-success, #27ae60)' }}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}