# Code Snippets Reutilizables

## Frontend - Componente con Formulario Estándar

```tsx
import { useState } from 'react'

interface Props {
  token: string
}

export default function NombreComponente({ token }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // lógica...
    setLoading(false)
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Título</h1>
      </div>

      {/* Botón nuevo */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}>+ Nuevo</button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Nuevo</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>Crear</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="card">
        <table>
          <thead><tr><th>Campo</th><th>Acciones</th></tr></thead>
          <tbody>
            {/* items.map(item => ... */}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

## Backend - Route con Auth

```ts
import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const router = Router()
const JWT_SECRET = 'crypto-manager-secret-key-2024'

const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    ;(req as any).user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

router.use(authenticate)

// GET all
router.get('/', (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const items = db.prepare('SELECT * FROM tabla WHERE user_id = ?').all(userId)
  res.json(items)
})

// POST create
router.post('/', (req: Request, res: Response) => {
  const { campo } = req.body
  const userId = (req as any).user.id
  
  if (!campo) {
    return res.status(400).json({ error: 'Campo requerido' })
  }
  
  const result = db.prepare('INSERT INTO tabla (user_id, campo) VALUES (?, ?)').run(userId, campo)
  res.status(201).json({ id: result.lastInsertRowid })
})

export default router
```

## CSS - Variables de Theme

```css
/* Dark Theme */
[data-theme="dark"] {
  --bg-primary: #242424;
  --bg-secondary: #1a1a1a;
  --bg-card: #1a1a1a;
  --bg-input: #2a2a2a;
  --bg-selected: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --border-color: #444444;
}

/* Light Theme */
[data-theme="light"] {
  --bg-primary: #f5f5f5;
  --bg-secondary: #e8e8e8;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --bg-selected: #f5f5f5;
  --text-primary: #213547;
  --text-secondary: #666666;
  --border-color: #dddddd;
}
```

## React - useEffect con cleanup

```ts
useEffect(() => {
  let mounted = true
  
  const fetchData = async () => {
    const response = await fetch('/api/data')
    if (mounted) {
      setData(await response.json())
    }
  }
  
  fetchData()
  
  return () => { mounted = false }
}, [dependency])
```

## Express - Validar ownership

```ts
// Verificar que el recurso pertenece al usuario
const item = db.prepare('SELECT * FROM tabla WHERE id = ? AND user_id = ?').get(id, userId)
if (!item) {
  return res.status(404).json({ error: 'No encontrado' })
}
```
