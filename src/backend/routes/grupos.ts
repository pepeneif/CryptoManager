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

// Get all grupos (admin only)
router.get('/admin/grupos', (req: Request, res: Response) => {
  const user = (req as any).user
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  const grupos = db.prepare('SELECT * FROM grupos ORDER BY nombre').all()
  res.json(grupos)
})

// Create grupo
router.post('/admin/grupos', (req: Request, res: Response) => {
  const user = (req as any).user
  const { nombre } = req.body
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del grupo es requerido' })
  }
  
  const userId = user.id
  const result = db.prepare('INSERT INTO grupos (nombre, created_by) VALUES (?, ?)').run(nombre, userId)
  res.status(201).json({ id: result.lastInsertRowid, nombre })
})

// Delete grupo
router.delete('/admin/grupos/:id', (req: Request, res: Response) => {
  const user = (req as any).user
  const { id } = req.params
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  // Remove grupo_id from users
  db.prepare('UPDATE users SET grupo_id = NULL WHERE grupo_id = ?').run(id)
  // Remove grupo_id from empresas
  db.prepare('UPDATE empresas SET grupo_id = NULL WHERE grupo_id = ?').run(id)
  // Delete grupo
  db.prepare('DELETE FROM grupos WHERE id = ?').run(id)
  
  res.json({ message: 'Grupo eliminado' })
})

export default router