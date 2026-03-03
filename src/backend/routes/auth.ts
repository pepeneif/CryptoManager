import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'
import { config } from '../config.js'

const router = Router()

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, grupo_id: user.grupo_id },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({ token, user: { id: user.id, username: user.username, role: user.role, grupo_id: user.grupo_id } })
})

router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  
  try {
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword)
    const token = jwt.sign(
      { id: result.lastInsertRowid, username, role: 'user' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    )
    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' })
  }
})

export default router

// Middleware para autenticar token
export const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' })
    }
    (req as any).user = user
    next()
  })
}