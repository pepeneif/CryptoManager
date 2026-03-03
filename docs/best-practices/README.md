# Best Practices - CryptoManager

This guide outlines the development standards and best practices for contributing to CryptoManager.

## Quick Checklist

Before submitting code, ensure:
- [ ] Theme support works (light/dark modes)
- [ ] No hardcoded colors - only CSS variables
- [ ] Cards use `var(--bg-card)` background
- [ ] Inputs use `var(--bg-input)` background
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No `console.log` statements left in code
- [ ] Form layout follows standard pattern

## CSS Variables (REQUIRED)

Always use CSS variables for theming. Never hardcode colors.

### Core Variables
```css
--bg-primary       /* Main background */
--bg-secondary     /* Sidebar background */
--bg-card          /* Card containers (CRITICAL for forms) */
--bg-input         /* Input fields */
--bg-selected      /* Selected menu items */
--text-primary     /* Primary text */
--text-secondary   /* Secondary text */
--border-color     /* Borders */
--accent-color     /* Primary buttons, links */
```

### Common Mistakes
- ❌ `background: '#1a1a1a'` → ✅ `background: 'var(--bg-card)'`
- ❌ `color: '#fff'` → ✅ `color: 'var(--text-primary)'`
- ❌ Missing `style` on `<div className="card">`

## Standard Form Design

All forms must follow this structure:

### 1. Header
```tsx
<div className="header" style={{ 
  marginBottom: '30px', 
  paddingBottom: '20px', 
  borderBottom: '1px solid var(--border-color)' 
}}>
  <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Title</h1>
</div>
```

### 2. "+ New" Button (when applicable)
```tsx
{!showForm && (
  <button 
    onClick={() => setShowForm(true)}
    style={{
      padding: '10px 16px',
      background: '#4a90d9',
      border: 'none',
      borderRadius: '5px',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      marginBottom: '20px'
    }}
  >
    + New Item
  </button>
)}
```

### 3. Form Card
```tsx
<div className="card" style={{ background: 'var(--bg-card)' }}>
  <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
    Form Title
  </h2>
  <form onSubmit={handleSubmit}>
    {/* Input fields */}
    <div style={{ marginBottom: '15px' }}>
      <input
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-input)',
          color: 'var(--text-primary)'
        }}
      />
    </div>
    
    {/* Footer with Cancel/Create buttons */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginTop: '10px' 
    }}>
      <button type="button" className="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" className="btn btn-primary">
        Create
      </button>
    </div>
  </form>
</div>
```

## Frontend (React + TypeScript)

### Component Structure
- One component per file
- PascalCase for component files (e.g., `Clientes.tsx`)
- Always type props with interfaces
- Use functional components with hooks

```tsx
interface Props {
  token: string
}

export default function ComponentName({ token }: Props) {
  // Component logic
}
```

### State Management
- Use `useState` for local state
- Use `useEffect` for side effects
- Always cleanup effects if needed

```tsx
const [data, setData] = useState<DataType[]>([])
const [loading, setLoading] = useState(false)

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

### Styling Rules
1. **Never hardcode colors** - Always use CSS variables
2. **Use inline styles for dynamic values** - Static styles go in CSS files
3. **Follow the form pattern** - Consistency across all forms
4. **Test both themes** - Always verify light and dark modes

## Backend (Express + TypeScript)

### Route Structure
- All routes prefixed with `/api`
- Use authentication middleware for protected routes
- JWT_SECRET must be consistent across all routes

```ts
import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const router = Router()
const JWT_SECRET = 'crypto-manager-secret-key-2024'

// Authentication middleware
const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    ;(req as any).user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

router.use(authenticate)

// Route handlers...
export default router
```

### Database Best Practices
- Always use prepared statements
- Verify ownership (user_id, empresa_id) on all queries
- Never expose sensitive data in responses

```ts
// GOOD - Prepared statement with ownership check
const item = db.prepare(
  'SELECT * FROM table WHERE id = ? AND user_id = ?'
).get(id, userId)

if (!item) {
  return res.status(404).json({ error: 'Not found' })
}

// BAD - No ownership verification
const item = db.prepare('SELECT * FROM table WHERE id = ?').get(id)
```

### CRITICAL: Route Order

In `src/backend/index.ts`, `systemConfigRoutes` MUST be registered FIRST:

```ts
// CORRECT
app.use('/api', systemConfigRoutes)  // No auth required
app.use('/api', cuentasRoutes)       // Has auth middleware
app.use('/api', clientesRoutes)      // Has auth middleware

// WRONG - Will cause 401 errors
app.use('/api', cuentasRoutes)       // Has auth middleware
app.use('/api', systemConfigRoutes)  // Will be blocked!
```

## Security Guidelines

### Authentication
- JWT tokens expire after 24 hours
- Passwords hashed with bcrypt (10 rounds)
- Always validate inputs before processing

### SQL Injection Prevention
- Always use prepared statements
- Never concatenate user input into SQL queries

```ts
// GOOD
const result = db.prepare(
  'INSERT INTO users (username, password) VALUES (?, ?)'
).run(username, hashedPassword)

// BAD - Vulnerable to SQL injection
const result = db.prepare(
  `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`
).run()
```

### Data Validation
- Validate all inputs on the server
- Return appropriate HTTP status codes
- Never trust client-side validation alone

```ts
router.post('/', (req: Request, res: Response) => {
  const { name, email } = req.body
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  
  // Process valid data...
})
```

## Git Workflow

### Commits
- Write clear, descriptive commit messages
- One logical change per commit
- Use present tense ("Add feature" not "Added feature")

```bash
# Good commit messages
git commit -m "Add client search functionality"
git commit -m "Fix theme toggle in dark mode"
git commit -m "Update API documentation"

# Bad commit messages
git commit -m "fix"
git commit -m "updates"
git commit -m "asdf"
```

### Branching
- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## Code Review Checklist

When reviewing code, check for:

### Functionality
- [ ] Feature works as expected
- [ ] Error handling is appropriate
- [ ] Edge cases are handled

### Code Quality
- [ ] No hardcoded colors (CSS variables only)
- [ ] No console.log statements
- [ ] TypeScript types are correct
- [ ] No unused imports or variables
- [ ] Functions are reasonably sized (< 50 lines)

### Security
- [ ] Input validation present
- [ ] Authentication checks in place
- [ ] No sensitive data exposed
- [ ] SQL injection prevention

### UI/UX
- [ ] Theme works in light and dark modes
- [ ] Cards have proper backgrounds
- [ ] Text is readable in both themes
- [ ] Form layout follows standard pattern

## Resources

- [UI Guide](../UI_GUIDE.md) - Detailed UI design system
- [Project README](../../README.md) - Project overview and setup
- [Feature Template](../templates/feature-template.md) - Template for new features

## Questions?

If you're unsure about any of these practices:
1. Check existing code for examples
2. Refer to the UI Guide for design questions
3. Ask in your pull request description
