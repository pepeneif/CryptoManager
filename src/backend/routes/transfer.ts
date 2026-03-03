import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'
import { config } from '../config.js'

const router = Router()

const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any
    ;(req as any).user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

router.use(authenticate)

// Transfer between accounts
router.post('/empresas/:empresaId/transfer', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const { cuenta_origen_id, cuenta_destino_id, monto, descripcion, fecha } = req.body
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  if (!cuenta_origen_id || !cuenta_destino_id || !monto) {
    return res.status(400).json({ error: 'Wallet origen, destino y monto son requeridos' })
  }

  if (cuenta_origen_id === cuenta_destino_id) {
    return res.status(400).json({ error: 'No se puede transferir a la misma cuenta' })
  }

  // Verify accounts belong to the company
  const cuentaOrigen = db.prepare('SELECT * FROM cuentas WHERE id = ? AND empresa_id = ?').get(cuenta_origen_id, empresaId)
  const cuentaDestino = db.prepare('SELECT * FROM cuentas WHERE id = ? AND empresa_id = ?').get(cuenta_destino_id, empresaId)

  if (!cuentaOrigen || !cuentaDestino) {
    return res.status(404).json({ error: 'Una o ambas cuentas no existen' })
  }

  if ((cuentaOrigen as any).balance < monto) {
    return res.status(400).json({ error: 'Saldo insuficiente' })
  }

  // Debit from origin
  db.prepare('UPDATE cuentas SET balance = balance - ? WHERE id = ?').run(monto, cuenta_origen_id)
  db.prepare(`
    INSERT INTO movimientos (empresa_id, cuenta_id, tipo, monto, moneda, descripcion, fecha, referencia)
    VALUES (?, ?, 'debit', ?, ?, ?, ?, 'Transferencia saliente')
  `).run(empresaId, cuenta_origen_id, monto, (cuentaOrigen as any).moneda, descripcion || 'Transferencia', fecha)

  // Credit to destination
  db.prepare('UPDATE cuentas SET balance = balance + ? WHERE id = ?').run(monto, cuenta_destino_id)
  db.prepare(`
    INSERT INTO movimientos (empresa_id, cuenta_id, tipo, monto, moneda, descripcion, fecha, referencia)
    VALUES (?, ?, 'credit', ?, ?, ?, ?, 'Transferencia entrante')
  `).run(empresaId, cuenta_destino_id, monto, (cuentaDestino as any).moneda, descripcion || 'Transferencia', fecha)

  res.json({ message: 'Transferencia exitosa', monto, origen: (cuentaOrigen as any).name, destino: (cuentaDestino as any).name })
})

export default router