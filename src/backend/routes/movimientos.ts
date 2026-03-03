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

// Get movimientos de una cuenta
router.get('/cuentas/:cuentaId/movimientos', (req: Request, res: Response) => {
  const { cuentaId } = req.params
  const userId = (req as any).user.id

  const cuenta = db.prepare(`
    SELECT c.* FROM cuentas c
    JOIN empresas e ON c.empresa_id = e.id
    WHERE c.id = ? AND e.user_id = ?
  `).get(cuentaId, userId)

  if (!cuenta) {
    return res.status(404).json({ error: 'Wallet no encontrada' })
  }

  const movimientos = db.prepare(`
    SELECT * FROM movimientos WHERE cuenta_id = ? ORDER BY fecha DESC, id DESC
  `).all(cuentaId)

  res.json(movimientos)
})

// Get all movimientos de una empresa
router.get('/empresas/:empresaId/movimientos', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  const movimientos = db.prepare(`
    SELECT m.*, c.name as cuenta_nombre
    FROM movimientos m
    JOIN cuentas c ON m.cuenta_id = c.id
    WHERE m.empresa_id = ?
    ORDER BY m.fecha DESC, m.id DESC
  `).all(empresaId)

  res.json(movimientos)
})

// Create movimiento (Receive, Spend, Transfer)
router.post('/cuentas/:cuentaId/movimientos', (req: Request, res: Response) => {
  const { cuentaId } = req.params
  const { tipo, monto, descripcion, fecha, referencia } = req.body
  const userId = (req as any).user.id

  const cuenta = db.prepare(`
    SELECT c.* FROM cuentas c
    JOIN empresas e ON c.empresa_id = e.id
    WHERE c.id = ? AND e.user_id = ?
  `).get(cuentaId, userId)

  if (!cuenta) {
    return res.status(404).json({ error: 'Wallet no encontrada' })
  }

  if (!tipo || !monto || !fecha) {
    return res.status(400).json({ error: 'Tipo, monto y fecha son requeridos' })
  }

  // Insert movimiento
  const result = db.prepare(`
    INSERT INTO movimientos (empresa_id, cuenta_id, tipo, monto, moneda, descripcion, fecha, referencia, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run((cuenta as any).empresa_id, cuentaId, tipo, monto, (cuenta as any).moneda, descripcion || null, fecha, referencia || null, userId)

  // Update account balance
  const balanceChange = tipo === 'credit' ? monto : -monto
  db.prepare('UPDATE cuentas SET balance = balance + ? WHERE id = ?').run(balanceChange, cuentaId)

  const newMovimiento = db.prepare('SELECT * FROM movimientos WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newMovimiento)
})

// Delete movimiento (revertir)
router.delete('/movimientos/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const movimiento = db.prepare(`
    SELECT m.* FROM movimientos m
    JOIN empresas e ON m.empresa_id = e.id
    WHERE m.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!movimiento) {
    return res.status(404).json({ error: 'Movimiento no encontrado' })
  }

  // Revertir balance
  const balanceChange = (movimiento as any).tipo === 'credit' ? -(movimiento as any).monto : (movimiento as any).monto
  db.prepare('UPDATE cuentas SET balance = balance + ? WHERE id = ?').run(balanceChange, (movimiento as any).cuenta_id)

  // Delete movimiento
  db.prepare('DELETE FROM movimientos WHERE id = ?').run(id)

  res.json({ message: 'Movimiento eliminado y balance actualizado' })
})

export default router