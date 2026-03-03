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

// Get empresa datos
router.get('/empresas/:empresaId/datos', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  let datos = db.prepare('SELECT * FROM empresa_datos WHERE empresa_id = ?').get(empresaId)
  
  if (!datos) {
    // Create default datos
    const result = db.prepare('INSERT INTO empresa_datos (empresa_id, created_by) VALUES (?, ?)').run(empresaId, userId)
    datos = db.prepare('SELECT * FROM empresa_datos WHERE id = ?').get(result.lastInsertRowid)
  }

  res.json(datos)
})

// Update empresa datos
router.put('/empresas/:empresaId/datos', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const { nombre, nombre_comercial, identificacion_fiscal, telefono, email, direccion, ciudad, pais, codigo_postal, website, logo_url } = req.body
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  // Check if datos exists
  const existing = db.prepare('SELECT id FROM empresa_datos WHERE empresa_id = ?').get(empresaId)
  
  if (!existing) {
    db.prepare(`
      INSERT INTO empresa_datos (empresa_id, nombre, nombre_comercial, identificacion_fiscal, telefono, email, direccion, ciudad, pais, codigo_postal, website, logo_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(empresaId, nombre || '', nombre_comercial || '', identificacion_fiscal || '', telefono || '', email || '', direccion || '', ciudad || '', pais || '', codigo_postal || '', website || '', logo_url || '', userId)
  } else {
    db.prepare(`
      UPDATE empresa_datos SET 
        nombre = ?,
        nombre_comercial = ?,
        identificacion_fiscal = ?,
        telefono = ?,
        email = ?,
        direccion = ?,
        ciudad = ?,
        pais = ?,
        codigo_postal = ?,
        website = ?,
        logo_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE empresa_id = ?
    `).run(
      nombre ?? '',
      nombre_comercial ?? '',
      identificacion_fiscal ?? '',
      telefono ?? '',
      email ?? '',
      direccion ?? '',
      ciudad ?? '',
      pais ?? '',
      codigo_postal ?? '',
      website ?? '',
      logo_url ?? '',
      empresaId
    )
  }

  const datos = db.prepare('SELECT * FROM empresa_datos WHERE empresa_id = ?').get(empresaId)
  res.json(datos)
})

export default router