import { Router } from 'express'
import { db } from '../db.js'

const router = Router()

// GET /api/admin/system-config - obtener toda la config
router.get('/admin/system-config', (_req, res) => {
  try {
    const config = db.prepare('SELECT clave, valor FROM system_config').all()
    const result: Record<string, string> = {}
    config.forEach((row: any) => {
      result[row.clave] = row.valor
    })
    res.json(result)
  } catch (err) {
    console.error('Error fetching system config:', err)
    res.status(500).json({ error: 'Error al obtener configuración' })
  }
})

// PUT /api/admin/system-config - actualizar config
router.put('/admin/system-config', (req, res) => {
  try {
    const { configs } = req.body
    
    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({ error: 'Se requiere un objeto de configuración' })
    }

    const stmt = db.prepare(`
      INSERT INTO system_config (clave, valor, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, updated_at = CURRENT_TIMESTAMP
    `)

    const transaction = db.transaction(() => {
      for (const [clave, valor] of Object.entries(configs)) {
        stmt.run(clave, String(valor))
      }
    })

    transaction()
    res.json({ success: true, message: 'Configuración actualizada' })
  } catch (err) {
    console.error('Error updating system config:', err)
    res.status(500).json({ error: 'Error al actualizar configuración' })
  }
})

export default router
