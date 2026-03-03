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

// Get all facturas
router.get('/empresas/:empresaId/facturas', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const userId = (req as any).user.id
  
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }
  
  const facturas = db.prepare(`
    SELECT f.*, c.name as cliente_nombre, p.name as proveedor_nombre
    FROM facturas f
    LEFT JOIN clientes c ON f.cliente_id = c.id
    LEFT JOIN proveedores p ON f.proveedor_id = p.id
    WHERE f.empresa_id = ?
    ORDER BY f.fecha DESC
  `).all(empresaId)
  res.json(facturas)
})

// Create factura
router.post('/empresas/:empresaId/facturas', (req: Request, res: Response) => {
  const { empresaId } = req.params
  const { tipo, cliente_id, proveedor_id, numero, fecha, fecha_vencimiento, monto, moneda, descripcion } = req.body
  const userId = (req as any).user.id

  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(empresaId, userId)
  if (!empresa) {
    return res.status(404).json({ error: 'Empresa no encontrada' })
  }

  if (!tipo || !numero || !fecha || !monto) {
    return res.status(400).json({ error: 'Tipo, número, fecha y monto son requeridos' })
  }

  const result = db.prepare(`
    INSERT INTO facturas (empresa_id, tipo, cliente_id, proveedor_id, numero, fecha, fecha_vencimiento, monto, moneda, descripcion, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(empresaId, tipo, cliente_id || null, proveedor_id || null, numero, fecha, fecha_vencimiento || null, monto, moneda || 'USD', descripcion || null, userId)

  const newFactura = db.prepare('SELECT * FROM facturas WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newFactura)
})

// Update factura
router.put('/facturas/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { tipo, cliente_id, proveedor_id, numero, fecha, fecha_vencimiento, monto, moneda, estado, descripcion } = req.body
  const userId = (req as any).user.id

  const factura = db.prepare(`
    SELECT f.* FROM facturas f
    JOIN empresas e ON f.empresa_id = e.id
    WHERE f.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!factura) {
    return res.status(404).json({ error: 'Factura no encontrada' })
  }

  db.prepare(`
    UPDATE facturas SET tipo = ?, cliente_id = ?, proveedor_id = ?, numero = ?, fecha = ?, 
    fecha_vencimiento = ?, monto = ?, moneda = ?, estado = ?, descripcion = ?
    WHERE id = ?
  `).run(tipo, cliente_id, proveedor_id, numero, fecha, fecha_vencimiento, monto, moneda, estado, descripcion, id)

  const updatedFactura = db.prepare('SELECT * FROM facturas WHERE id = ?').get(id)
  res.json(updatedFactura)
})

// Delete factura
router.delete('/facturas/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const factura = db.prepare(`
    SELECT f.* FROM facturas f
    JOIN empresas e ON f.empresa_id = e.id
    WHERE f.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!factura) {
    return res.status(404).json({ error: 'Factura no encontrada' })
  }

  db.prepare('DELETE FROM facturas WHERE id = ?').run(id)
  res.json({ message: 'Factura eliminada' })
})

// === FACTURA ITEMS ===

// Get items de una factura
router.get('/facturas/:facturaId/items', (req: Request, res: Response) => {
  const { facturaId } = req.params
  const userId = (req as any).user.id

  const factura = db.prepare(`
    SELECT f.* FROM facturas f
    JOIN empresas e ON f.empresa_id = e.id
    WHERE f.id = ? AND e.user_id = ?
  `).get(facturaId, userId)

  if (!factura) {
    return res.status(404).json({ error: 'Factura no encontrada' })
  }

  const items = db.prepare('SELECT * FROM factura_items WHERE factura_id = ? ORDER BY id').all(facturaId)
  res.json(items)
})

// Create item de factura
router.post('/facturas/:facturaId/items', (req: Request, res: Response) => {
  const { facturaId } = req.params
  const { descripcion, cantidad, precio_unitario } = req.body
  const userId = (req as any).user.id

  const factura = db.prepare(`
    SELECT f.* FROM facturas f
    JOIN empresas e ON f.empresa_id = e.id
    WHERE f.id = ? AND e.user_id = ?
  `).get(facturaId, userId)

  if (!factura) {
    return res.status(404).json({ error: 'Factura no encontrada' })
  }

  if (!descripcion || !precio_unitario) {
    return res.status(400).json({ error: 'Descripción y precio son requeridos' })
  }

  const qty = cantidad || 1
  const total = qty * precio_unitario

  const result = db.prepare(`
    INSERT INTO factura_items (factura_id, descripcion, cantidad, precio_unitario, total)
    VALUES (?, ?, ?, ?, ?)
  `).run(facturaId, descripcion, qty, precio_unitario, total)

  // Update factura monto
  const items = db.prepare('SELECT SUM(total) as total FROM factura_items WHERE factura_id = ?').get(facturaId) as any
  db.prepare('UPDATE facturas SET monto = ? WHERE id = ?').run(items?.total || 0, facturaId)

  const newItem = db.prepare('SELECT * FROM factura_items WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(newItem)
})

// Update item
router.put('/items/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { descripcion, cantidad, precio_unitario } = req.body
  const userId = (req as any).user.id

  const item = db.prepare(`
    SELECT fi.* FROM factura_items fi
    JOIN facturas f ON fi.factura_id = f.id
    JOIN empresas e ON f.empresa_id = e.id
    WHERE fi.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!item) {
    return res.status(404).json({ error: 'Item no encontrado' })
  }

  const qty = cantidad || 1
  const total = qty * precio_unitario

  db.prepare(`
    UPDATE factura_items SET descripcion = ?, cantidad = ?, precio_unitario = ?, total = ?
    WHERE id = ?
  `).run(descripcion, qty, precio_unitario, total, id)

  // Update factura monto
  const facturaItem = item as any
  const items = db.prepare('SELECT SUM(total) as total FROM factura_items WHERE factura_id = ?').get(facturaItem.factura_id) as any
  db.prepare('UPDATE facturas SET monto = ? WHERE id = ?').run(items?.total || 0, facturaItem.factura_id)

  const updatedItem = db.prepare('SELECT * FROM factura_items WHERE id = ?').get(id)
  res.json(updatedItem)
})

// Delete item
router.delete('/items/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).user.id

  const item = db.prepare(`
    SELECT fi.* FROM factura_items fi
    JOIN facturas f ON fi.factura_id = f.id
    JOIN empresas e ON f.empresa_id = e.id
    WHERE fi.id = ? AND e.user_id = ?
  `).get(id, userId)

  if (!item) {
    return res.status(404).json({ error: 'Item no encontrado' })
  }

  const facturaItem = item as any
  const facturaId = facturaItem.factura_id

  db.prepare('DELETE FROM factura_items WHERE id = ?').run(id)

  // Update factura monto
  const items = db.prepare('SELECT SUM(total) as total FROM factura_items WHERE factura_id = ?').get(facturaId) as any
  db.prepare('UPDATE facturas SET monto = ? WHERE id = ?').run(items?.total || 0, facturaId)

  res.json({ message: 'Item eliminado' })
})

export default router