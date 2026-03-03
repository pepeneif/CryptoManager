import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'
import { config } from '../config.js'

const router = Router()

// Middleware to verify token
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

// Get all cuentas for an empresa
router.get('/empresas/:empresaId/cuentas', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const userId = (req as any).user.id

  // Verify empresa belongs to user
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  const cuentas = db.prepare('SELECT * FROM cuentas WHERE empresa_id = ? ORDER BY created_at DESC').all(empresaId)
  res.json(cuentas)
})

// Create cuenta
router.post('/empresas/:empresaId/cuentas', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const { name, tipo, moneda, balance, wallet_address } = req.body
  const userId = (req as any).user.id

  // Verify empresa belongs to user
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' })
  }

  const result = db.prepare(
    'INSERT INTO cuentas (empresa_id, name, tipo, moneda, balance, wallet_address, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(empresaId, name, tipo || 'cash', moneda || 'USD', balance || 0, wallet_address || null, userId)

  const newWallet = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newWallet)
})

// Update cuenta
router.put('/cuentas/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, tipo, moneda, balance, wallet_address } = req.body
  const userId = (req as any).user.id

  // Verify cuenta belongs to user's empresa
  const cuenta = db.prepare(`
    SELECT c.* FROM cuentas c
    JOIN empresas e ON c.empresa_id = e.id
    WHERE c.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!cuenta) {
    return res.status(404).json({ error: 'Wallet no encontrada' })
  }

  db.prepare(`
    UPDATE cuentas 
    SET name = ?, tipo = ?, moneda = ?, balance = ?, wallet_address = ?
    WHERE id = ?
  `).run(name, tipo, moneda, balance, wallet_address, id)

  const updatedWallet = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(id)
  res.json(updatedWallet)
})

// Delete cuenta
router.delete('/cuentas/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const cuenta = db.prepare(`
    SELECT c.* FROM cuentas c
    JOIN empresas e ON c.empresa_id = e.id
    WHERE c.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!cuenta) {
    return res.status(404).json({ error: 'Wallet no encontrada' })
  }

  db.prepare('DELETE FROM cuentas WHERE id = ?').run(id)
  res.json({ message: 'Wallet eliminada' })
})

export default router