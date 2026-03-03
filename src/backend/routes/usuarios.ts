import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
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

// Get all users (admin only)
router.get('/admin/usuarios', (req: Request, res: Response) => {
  const user = (req as any).user
  
  // Only admins can manage users
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  const usuarios = db.prepare('SELECT id, username, role, enabled, name, email, grupo_id, created_at FROM users').all()
  res.json(usuarios)
})

// Create user
router.post('/admin/usuarios', (req: Request, res: Response) => {
  const user = (req as any).user
  const { name, username, email, password, role, grupo_id } = req.body
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' })
  }
  
  // Check if username exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(400).json({ error: 'El usuario ya existe' })
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, password, role, name, email, grupo_id, enabled) VALUES (?, ?, ?, ?, ?, ?, 1)').run(
    username, 
    hashedPassword, 
    role || 'user',
    name || null,
    email || null,
    grupo_id || null
  )
  
  res.status(201).json({ id: result.lastInsertRowid, username, role: role || 'user', name, email, grupo_id })
})

// Update user
router.put('/admin/usuarios/:id', (req: Request, res: Response) => {
  const user = (req as any).user
  const { id } = req.params
  const { username, name, email, password, role, enabled } = req.body
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  // Cannot edit yourself
  if (parseInt(id) === user.id) {
    return res.status(400).json({ error: 'No puedes editar tu propio usuario' })
  }
  
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
  if (!existing) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }
  
  if (username) {
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, id)
  }
  if (name !== undefined) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, id)
  }
  if (email !== undefined) {
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, id)
  }
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10)
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id)
  }
  if (role) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
  }
  if (enabled !== undefined) {
    db.prepare('UPDATE users SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id)
  }
  
  res.json({ message: 'Usuario actualizado' })
})

// Delete user
router.delete('/admin/usuarios/:id', (req: Request, res: Response) => {
  const user = (req as any).user
  const { id } = req.params
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  // Cannot delete yourself
  if (parseInt(id) === user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' })
  }
  
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
  if (!existing) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }
  
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  res.json({ message: 'Usuario eliminado' })
})

// Toggle user enabled/disabled
router.put('/admin/usuarios/:id/toggle', (req: Request, res: Response) => {
  const user = (req as any).user
  const { id } = req.params
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden acceder' })
  }
  
  if (parseInt(id) === user.id) {
    return res.status(400).json({ error: 'No puedes deshabilitar tu propio usuario' })
  }
  
  const existing = db.prepare('SELECT enabled FROM users WHERE id = ?').get(id) as any
  if (!existing) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }
  
  const newEnabled = existing.enabled ? 0 : 1
  db.prepare('UPDATE users SET enabled = ? WHERE id = ?').run(newEnabled, id)
  
  res.json({ message: newEnabled ? 'Usuario habilitado' : 'Usuario deshabilitado', enabled: newEnabled })
})

export default router