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

// Get all proveedores
router.get('/empresas/:empresaId/proveedores', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const userId = (req as any).user.id
  
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }
  
  const proveedores = db.prepare('SELECT * FROM proveedores WHERE empresa_id = ? ORDER BY name').all(empresaId)
  res.json(proveedores)
})

// Create proveedor
router.post('/empresas/:empresaId/proveedores', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const { name, email, telefono, direccion, direccion_fisica, datos_fiscales } = req.body
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' })
  }

  const result = db.prepare(
    'INSERT INTO proveedores (empresa_id, name, email, telefono, direccion, direccion_fisica, datos_fiscales, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(empresaId, name, email || null, telefono || null, direccion || null, direccion_fisica || null, datos_fiscales || null, userId)

  const newProveedor = db.prepare('SELECT * FROM proveedores WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newProveedor)
})

// Update proveedor
router.put('/proveedores/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, email, telefono, direccion } = req.body
  const userId = (req as any).user.id

  const proveedor = db.prepare(`
    SELECT p.* FROM proveedores p
    JOIN empresas e ON p.empresa_id = e.id
    WHERE p.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!proveedor) {
    return res.status(404).json({ error: 'Proveedor no encontrado' })
  }

  db.prepare('UPDATE proveedores SET name = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?')
    .run(name, email, telefono, direccion, id)

  const updatedProveedor = db.prepare('SELECT * FROM proveedores WHERE id = ?').get(id)
  res.json(updatedProveedor)
})

// Delete proveedor
router.delete('/proveedores/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const proveedor = db.prepare(`
    SELECT p.* FROM proveedores p
    JOIN empresas e ON p.empresa_id = e.id
    WHERE p.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!proveedor) {
    return res.status(404).json({ error: 'Proveedor no encontrado' })
  }

  db.prepare('DELETE FROM proveedores WHERE id = ?').run(id)
  res.json({ message: 'Proveedor eliminado' })
})

export default router