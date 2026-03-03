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

// Get all empresas for the user
router.get('/', (req: Request, res: Response) => {
  const user = (req as any).user
  const userId = user.id
  const grupoId = user.grupo_id
  
  let empresas
  if (grupoId) {
    // User belongs to a group - see empresas of the group
    empresas = db.prepare('SELECT * FROM empresas WHERE grupo_id = ? OR user_id = ? ORDER BY name').all(grupoId, userId)
  } else {
    // User doesn't belong to a group - see only their own empresas
    empresas = db.prepare('SELECT * FROM empresas WHERE user_id = ? ORDER BY name').all(userId)
  }
  res.json(empresas)
})

// Get single empresa
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id
  
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(id, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }
  res.json(empresa)
})

// Create empresa
router.post('/', (req: Request, res: Response) => {
  const { name } = req.body
  const user = (req as any).user
  const userId = user.id
  const grupoId = user.grupo_id

  if (!name) {
    return res.status(400).json({ error: 'El nombre es requerido' })
  }

  const result = db.prepare('INSERT INTO empresas (user_id, grupo_id, name, created_by) VALUES (?, ?, ?, ?)').run(userId, grupoId, name, userId)
  
  const newEmpresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newEmpresa)
})

// Update empresa
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name } = req.body
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(id, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  db.prepare('UPDATE empresas SET name = ? WHERE id = ?').run(name, id)
  
  const updatedEmpresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(id)
  res.json(updatedEmpresa)
})

// Delete empresa
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(id, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  // Delete related cuentas first
  db.prepare('DELETE FROM cuentas WHERE empresa_id = ?').run(id)
  db.prepare('DELETE FROM empresas WHERE id = ?').run(id)
  
  res.json({ message: 'Empresa eliminada' })
})

export default router