import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

// Tipo de pago autorizado
interface PagoAutorizado {
  id: number
  monto: string
  token: string
  token_symbol: string
  token_decimal: number
  destino: string
  destino_nombre?: string
  fecha_autorizacion: string
  empresa_nombre: string
  referencia?: string
  blockchain?: string
  gas_estimado?: string
}

// Estado de firma
type FirmarEstado = 'idle' | 'conectando' | 'firmando' | 'exito' | 'error'

interface Props {
  token: string
}

export default function Pagos({ token }: Props) {
  const { empresaId } = useParams()
  const [pagos, setPagos] = useState<PagoAutorizado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [estadoFirma, setEstadoFirma] = useState<Record<number, FirmarEstado>>({})
  const [mensajeFirma, setMensajeFirma] = useState<Record<number, string>>({})

  useEffect(() => {
    fetchPagosAutorizados()
  }, [empresaId, token])

  const fetchPagosAutorizados = async () => {
    try {
      const url = empresaId 
        ? `/api/empresas/${empresaId}/pagos/autorizados`
        : `/api/pagos/autorizados`
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPagos(data)
      } else {
        // Para desarrollo/demo: datos mock
        setPagos(getPagosDemo())
      }
    } catch (err) {
      console.error('Error fetching pagos:', err)
      setPagos(getPagosDemo()) // Demo fallback
    } finally {
      setLoading(false)
    }
  }

  // Datos de demo para desarrollo
  const getPagosDemo = (): PagoAutorizado[] => [
    {
      id: 1,
      monto: '1500.00',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      token_symbol: 'USDC',
      token_decimal: 6,
      destino: '0x742d35Cc6634C0532925a3b844Bc9e7595f3b3E0',
      destino_nombre: 'Proveedor Tech Services',
      fecha_autorizacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      empresa_nombre: 'Empresa Demo',
      referencia: 'FAC-2024-001',
      blockchain: 'Ethereum'
    },
    {
      id: 2,
      monto: '0.5',
      token: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      token_symbol: 'WBTC',
      token_decimal: 8,
      destino: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      destino_nombre: 'Vendor International',
      fecha_autorizacion: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      empresa_nombre: 'Empresa Demo',
      referencia: 'FAC-2024-002',
      blockchain: 'Ethereum'
    },
    {
      id: 3,
      monto: '2500.00',
      token: '0x6B175474E89094C44Da98b954EesadCDa7429C44',
      token_symbol: 'DAI',
      token_decimal: 18,
      destino: '0x1234567890abcdef1234567890abcdef12345678',
      destino_nombre: 'Consulting Corp',
      fecha_autorizacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      empresa_nombre: 'Empresa Demo',
      referencia: 'FAC-2024-003',
      blockchain: 'Ethereum'
    }
  ]

  // Detectar tipo de wallet disponible
  const detectarWallet = (): 'metamask' | 'phantom' | 'none' => {
    if (typeof window === 'undefined') return 'none'
    
    const ethereum = (window as any).ethereum
    if (ethereum?.isMetaMask) return 'metamask'
    if (ethereum?.isPhantom) return 'phantom'
    
    // Phantom en Solana
    if ((window as any).solana?.isPhantom) return 'phantom'
    
    return 'none'
  }

  // Firmar transacción con MetaMask
  const firmarConMetaMask = async (pago: PagoAutorizado) => {
    const walletType = detectarWallet()
    
    if (walletType === 'none') {
      setMensajeFirma(prev => ({ ...prev, [pago.id]: 'Error: No se detectó wallet. Instala MetaMask o Phantom.' }))
      setEstadoFirma(prev => ({ ...prev, [pago.id]: 'error' }))
      return
    }

    try {
      setEstadoFirma(prev => ({ ...prev, [pago.id]: 'conectando' }))
      setMensajeFirma(prev => ({ ...prev, [pago.id]: 'Conectando con wallet...' }))

      const ethereum = (window as any).ethereum
      
      // Solicitar conexión si no está conectado
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No hay cuentas conectadas')
      }

      setEstadoFirma(prev => ({ ...prev, [pago.id]: 'firmando' }))
      setMensajeFirma(prev => ({ ...prev, [pago.id]: 'Esperando confirmación...' }))

      // Preparar transacción
      const montoEnWei = (parseFloat(pago.monto) * Math.pow(10, pago.token_decimal)).toString(16)
      
      const txParams = {
        from: accounts[0],
        to: pago.token, // Token ERC-20
        data: construirDataERC20(pago.destino, montoEnWei, pago.token_decimal),
        value: '0x0'
      }

      // Enviar transacción
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      })

      setEstadoFirma(prev => ({ ...prev, [pago.id]: 'exito' }))
      setMensajeFirma(prev => ({ ...prev, [pago.id]: `Transacción enviada: ${txHash.slice(0, 10)}...` }))
      
      // Opcional: registrar en backend
      await registrarTransaccion(pago.id, txHash)

    } catch (err: any) {
      console.error('Error firmando:', err)
      setEstadoFirma(prev => ({ ...prev, [pago.id]: 'error' }))
      
      if (err.code === 4001) {
        setMensajeFirma(prev => ({ ...prev, [pago.id]: 'Transacción rechazada por el usuario' }))
      } else {
        setMensajeFirma(prev => ({ ...prev, [pago.id]: `Error: ${err.message || 'Error desconocido'}` }))
      }
    }
  }

  // Construir data para transferencia ERC-20 (transfer(address,uint256))
  const construirDataERC20 = (destino: string, montoHex: string, decimals: number): string => {
    // Función transfer: 0xa9059cbb
    const methodId = '0xa9059cbb'
    // Padding de dirección destino (20 bytes = 40 hex chars)
    const destinoPad = destino.replace(/^0x/, '').padStart(40, '0')
    // Padding de monto (32 bytes = 64 hex chars)
    const montoPad = montoHex.replace(/^0x/, '').padStart(64, '0')
    
    return `0x${methodId}${destinoPad}${montoPad}`
  }

  // Registrar transacción en backend
  const registrarTransaccion = async (pagoId: number, txHash: string) => {
    try {
      await fetch(`/api/pagos/${pagoId}/firmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tx_hash: txHash })
      })
    } catch (err) {
      console.error('Error registrando tx:', err)
    }
  }

  // Formatear fecha
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear dirección wallet
  const formatearDireccion = (direccion: string) => {
    return `${direccion.slice(0, 6)}...${direccion.slice(-4)}`
  }

  const getEstadoColor = (estado: FirmarEstado) => {
    switch (estado) {
      case 'conectando': return 'var(--accent-color)'
      case 'firmando': return 'var(--accent-color)'
      case 'exito': return 'var(--color-success)'
      case 'error': return 'var(--color-error)'
      default: return 'var(--text-secondary)'
    }
  }

  if (loading) {
    return (
      <div className="dashboard" style={{ padding: '20px' }}>
        <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ margin: 0 }}>Pagos Autorizados</h1>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando pagos autorizados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0 }}>Pagos Autorizados</h1>
        <span className="badge" style={{ background: 'var(--color-success)' }}>
          {pagos.length} pendiente{pagos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {pagos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No hay pagos autorizados esperando firma.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pagos.map((pago) => (
            <div 
              key={pago.id} 
              className="card"
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'start'
              }}
            >
              {/* Monto */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75em', 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Monto
                </label>
                <div style={{ 
                  fontSize: '1.5em', 
                  fontWeight: 'bold',
                  color: 'var(--text-primary)'
                }}>
                  {pago.monto} <span style={{ fontSize: '0.6em', color: 'var(--accent-color)' }}>{pago.token_symbol}</span>
                </div>
              </div>

              {/* Destino */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75em', 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Destino
                </label>
                <div style={{ color: 'var(--text-primary)' }}>
                  {pago.destino_nombre || 'Sin nombre'}
                </div>
                <div style={{ 
                  fontSize: '0.85em', 
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {formatearDireccion(pago.destino)}
                </div>
              </div>

              {/* Fecha autorización */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75em', 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Autorizado
                </label>
                <div style={{ color: 'var(--text-primary)' }}>
                  {formatearFecha(pago.fecha_autorizacion)}
                </div>
                {pago.referencia && (
                  <div style={{ 
                    fontSize: '0.85em', 
                    color: 'var(--text-secondary)',
                    marginTop: '4px'
                  }}>
                    Ref: {pago.referencia}
                  </div>
                )}
              </div>

              {/* Token/Blockchain info */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75em', 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Token
                </label>
                <div style={{ 
                  fontSize: '0.85em', 
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {pago.token_symbol}
                </div>
                {pago.blockchain && (
                  <div style={{ 
                    fontSize: '0.75em', 
                    color: 'var(--text-secondary)',
                    marginTop: '2px'
                  }}>
                    {pago.blockchain}
                  </div>
                )}
              </div>

              {/* Botón Firmar y Feedback */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {estadoFirma[pago.id] === 'exito' ? (
                  <button 
                    className="btn" 
                    disabled
                    style={{ 
                      background: 'var(--color-success)', 
                      color: 'white',
                      opacity: 0.7,
                      cursor: 'not-allowed'
                    }}
                  >
                    ✓ Firmado
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => firmarConMetaMask(pago)}
                    disabled={estadoFirma[pago.id] === 'conectando' || estadoFirma[pago.id] === 'firmando'}
                    style={{ 
                      background: 'var(--accent-color)',
                      opacity: (estadoFirma[pago.id] === 'conectando' || estadoFirma[pago.id] === 'firmando') ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {estadoFirma[pago.id] === 'conectando' && '⏳'}
                    {estadoFirma[pago.id] === 'firmando' && '⏳'}
                    {estadoFirma[pago.id] !== 'conectando' && estadoFirma[pago.id] !== 'firmando' && '✍️'}
                    {estadoFirma[pago.id] === 'conectando' ? 'Conectando...' : 
                     estadoFirma[pago.id] === 'firmando' ? 'Firmando...' : 'Firmar'}
                  </button>
                )}

                {/* Feedback de estado */}
                {mensajeFirma[pago.id] && (
                  <div style={{ 
                    fontSize: '0.8em', 
                    color: getEstadoColor(estadoFirma[pago.id] || 'idle'),
                    padding: '8px',
                    borderRadius: '4px',
                    background: 'var(--bg-input)',
                    wordBreak: 'break-word'
                  }}>
                    {estadoFirma[pago.id] === 'conectando' && '🔗 '}
                    {estadoFirma[pago.id] === 'firmando' && '✍️ '}
                    {estadoFirma[pago.id] === 'exito' && '✅ '}
                    {estadoFirma[pago.id] === 'error' && '❌ '}
                    {mensajeFirma[pago.id]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Extender window para TypeScript
declare global {
  interface Window {
    ethereum?: any
    solana?: any
  }
}
