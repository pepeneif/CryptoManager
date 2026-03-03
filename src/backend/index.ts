import express from 'express'
import cors from 'cors'
import './db.js'
import authRoutes from './routes/auth.js'
import empresasRoutes from './routes/empresas.js'
import cuentasRoutes from './routes/cuentas.js'
import clientesRoutes from './routes/clientes.js'
import proveedoresRoutes from './routes/proveedores.js'
import facturasRoutes from './routes/facturas.js'
import movimientosRoutes from './routes/movimientos.js'
import transferRoutes from './routes/transfer.js'
import usuariosRoutes from './routes/usuarios.js'
import empresaDatosRoutes from './routes/empresaDatos.js'
import gruposRoutes from './routes/grupos.js'
import systemConfigRoutes from './routes/systemConfig.js'
import coinsRoutes from './routes/coins.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes - systemConfig FIRST (no auth)
app.use('/api', systemConfigRoutes)

// Coins & Exchange Rates CRUD
app.use('/api', coinsRoutes)

// Auth routes
app.use('/api/auth', authRoutes)
app.use('/api/empresas', empresasRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CryptoManager API running' })
})

// All other routes (with auth)
app.use('/api', cuentasRoutes)
app.use('/api', clientesRoutes)
app.use('/api', proveedoresRoutes)
app.use('/api', facturasRoutes)
app.use('/api', movimientosRoutes)
app.use('/api/empresas', transferRoutes)
app.use('/api', usuariosRoutes)
app.use('/api', empresaDatosRoutes)
app.use('/api', gruposRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   CryptoManager API                       ║
  ║   Puerto: ${PORT}                            ║
  ║   Entorno: Desarrollo                     ║
  ╚═══════════════════════════════════════════╝
  `)
})
