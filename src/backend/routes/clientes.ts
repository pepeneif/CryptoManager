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

// Get all clientes
router.get('/empresas/:empresaId/clientes', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const userId = (req as any).user.id
  
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }
  
  const clientes = db.prepare('SELECT * FROM clientes WHERE empresa_id = ? ORDER BY name').all(empresaId)
  res.json(clientes)
})

// Create cliente
router.post('/empresas/:empresaId/clientes', (req: Request, res: Response) => {
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
    'INSERT INTO clientes (empresa_id, name, email, telefono, direccion, direccion_fisica, datos_fiscales, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(empresaId, name, email || null, telefono || null, direccion || null, direccion_fisica || null, datos_fiscales || null, userId)

  const newCliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newCliente)
})

// Update cliente
router.put('/clientes/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, email, telefono, direccion } = req.body
  const userId = (req as any).user.id

  const cliente = db.prepare(`
    SELECT c.* FROM clientes c
    JOIN empresas e ON c.empresa_id = e.id
    WHERE c.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' })
  }

  db.prepare('UPDATE clientes SET name = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?')
    .run(name, email, telefono, direccion, id)

  const updatedCliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id)
  res.json(updatedCliente)
})

// Delete cliente
router.delete('/clientes/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const cliente = db.prepare(`
    SELECT c.* FROM clientes c
    JOIN empresas e ON c.empresa_id = e.id
    WHERE c.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' })
  }

  db.prepare('DELETE FROM clientes WHERE id = ?').run(id)
  res.json({ message: 'Cliente eliminado' })
})

export default router