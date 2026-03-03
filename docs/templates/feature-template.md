# Template: Nueva Feature

## IMPORTANTE: Revisa estas Mejores Prácticas ANTES de programar
Leer: `docs/best-practices/README.md`

## Pasos

### 1. Base de Datos
Si necesita nuevas tablas o columnas:
- Editar `src/backend/db.ts`
- Agregar migración si es necesario

### 2. Backend (API)
Crear nueva ruta en `src/backend/routes/`:
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
// GET, POST, PUT, DELETE según necesidad
export default router
```

### 3. Registrar ruta
Editar `src/backend/index.ts`:
```ts
import nuevaRuta from './routes/nueva.js'
app.use('/api', nuevaRuta)
```

### 4. Frontend (Componente)
Crear `src/components/Nombre.tsx`:
- **SIEMPRE usar variables CSS** para colores:
  - `var(--bg-card)` para cards
  - `var(--bg-input)` para inputs
  - `var(--text-primary)` para texto principal
  - `var(--text-secondary)` para texto secundario
  - `var(--border-color)` para bordes
- **NUNCA hardcodear colores** como `#1a1a1a` o `#fff`
- Diseño estándar para forms (ver mejores prácticas)

### 5. Registrar ruta
Editar `src/App.tsx`:
```tsx
import Nombre from './components/Nombre'
import Layout from './components/Layout'
// ...
<Route path="/nombre/:empresaId" element={token ? <Layout token={token}><Nombre token={token} /></Layout> : <Navigate to="/login" />} />
```

### 6. Menú (si aplica)
Editar `src/components/Layout.tsx`:
- Agregar item a `menuItems` o `bottomMenuItems`

## Errores Comunes a Evitar
- ❌ Card sin `style={{ background: 'var(--bg-card)' }}`
- ❌ Color hardcodeado como `#1a1a1a`, `#fff`, etc.
- ❌ Input sin variables CSS
- ❌ Olvidar agregar la ruta en App.tsx

## Checklist Antes de Entregar
- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] Theme light funciona correctamente
- [ ] Theme dark funciona correctamente  
- [ ] Cards tienen `var(--bg-card)` 
- [ ] Inputs tienen `var(--bg-input)`
- [ ] Textos usan variables correctas

## Para Tasks de Sub-Agents
Incluir esta instrucción:
"Usa las mejores prácticas de docs/best-practices/README.md"