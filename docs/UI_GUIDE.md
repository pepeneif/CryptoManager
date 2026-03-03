# CryptoManager UI Design System

This document describes the design system and UI patterns used in CryptoManager to ensure consistency across the application.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [CSS Variables](#css-variables)
3. [Layout Structure](#layout-structure)
4. [Components](#components)
5. [Form Patterns](#form-patterns)
6. [Theme System](#theme-system)

## Design Philosophy

CryptoManager follows these design principles:

- **Consistency**: All UI elements follow standardized patterns
- **Clarity**: Information is presented clearly with proper visual hierarchy
- **Efficiency**: Common actions are easily accessible
- **Professionalism**: Clean, modern aesthetic suitable for business use
- **Accessibility**: Proper contrast ratios and keyboard navigation support

## CSS Variables

All colors and theme values are defined as CSS variables in `src/index.css`. This enables consistent theming across the application.

### Core Variables

```css
/* Background Colors */
--bg-primary:      /* Main page background */
--bg-secondary:    /* Sidebar background */
--bg-card:         /* Card/form containers */
--bg-input:        /* Input fields */
--bg-selected:     /* Selected menu items */

/* Text Colors */
--text-primary:    /* Headings, primary text */
--text-secondary:  /* Descriptions, hints */

/* UI Colors */
--border-color:    /* Input borders, dividers */
--accent-color:    /* Primary buttons, links */
--color-success:   /* Success states */
--color-error:     /* Error states */
```

### Theme Values

#### Dark Theme (Default)
```css
--bg-primary: #242424;
--bg-secondary: #1a1a1a;
--bg-card: #1a1a1a;
--bg-input: #2a2a2a;
--bg-selected: #2a2a2a;
--text-primary: #ffffff;
--text-secondary: #888888;
--border-color: #444444;
--accent-color: #4a90d9;
--color-success: #27ae60;
--color-error: #e74c3c;
```

#### Light Theme
```css
--bg-primary: #f5f5f5;
--bg-secondary: #e8e8e8;
--bg-card: #ffffff;
--bg-input: #f0f0f0;
--bg-selected: #f5f5f5;
--text-primary: #213547;
--text-secondary: #666666;
--border-color: #dddddd;
--accent-color: #4a90d9;
--color-success: #27ae60;
--color-error: #e74c3c;
```

## Layout Structure

### Main Layout

The application uses a sidebar + main content layout:

```
┌─────────────────────────────────────────┐
│  Sidebar    │      Main Content         │
│  (200px)    │      (flex: 1)            │
│             │                           │
│  Logo       │  ┌─────────────────────┐  │
│  ─────────  │  │  Header             │  │
│  Menu Item  │  ├─────────────────────┤  │
│  Menu Item  │  │                     │  │
│  Menu Item  │  │  Content Cards      │  │
│  ─────────  │  │                     │  │
│  Settings   │  └─────────────────────┘  │
│  User       │                           │
└─────────────────────────────────────────┘
```

### Sidebar Component

The sidebar (`Layout.tsx`) features:
- **Collapsible**: Can be collapsed to 60px width
- **Active State**: Current page highlighted with left border accent
- **Sections**: Main menu items + bottom menu (Settings)
- **User Info**: Shows current username at bottom

**Key styling:**
```tsx
<div style={{
  width: collapsed ? '60px' : '200px',
  background: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border-color)',
}}>
```

### Content Area

The main content area:
- Has a header with page title and actions
- Uses cards to group related content
- Responsive padding (20px)

## Components

### Cards

Cards are the primary container for forms and content:

```tsx
<div className="card" style={{ background: 'var(--bg-card)' }}>
  <h2 style={{ color: 'var(--text-primary)' }}>Title</h2>
  {/* Content */}
</div>
```

**Card styling:**
- Background: `var(--bg-card)`
- Border radius: 10px
- Padding: 20px
- Margin bottom: 20px

### Forms

All forms follow a standardized structure:

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
    
    {/* Footer buttons */}
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

### Buttons

Two primary button styles:

**Primary Button:**
```tsx
<button className="btn btn-primary">
  Create
</button>
```
- Background: `#4a90d9` (accent color)
- Text: white
- Used for: Submit, Create, Save actions

**Secondary Button:**
```tsx
<button className="btn btn-secondary">
  Cancel
</button>
```
- Background: `#444` (dark) / `#ccc` (light)
- Text: white (dark) / dark (light)
- Used for: Cancel, Back, Secondary actions

### Tables

Data tables use consistent styling:

```tsx
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {/* Rows */}
  </tbody>
</table>
```

**Table styling:**
- Full width
- Collapsed borders
- Header: `var(--bg-input)` background
- Header text: `#4a90d9` (accent)
- Row borders: `1px solid var(--border-color)`
- Cell padding: 12px

### Input Fields

Standard input styling:

```tsx
<input
  style={{
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: '1em'
  }}
/>
```

## Form Patterns

### Create/Edit Form Pattern

All entity creation/editing follows this pattern:

1. **Header**: Page title + "+ New" button
2. **Form Card**: Appears when creating/editing
   - Title (h2)
   - Input fields
   - Footer with Cancel/Create buttons
3. **List Card**: Shows existing items in table

Example structure:
```tsx
<div className="dashboard" style={{ padding: '20px' }}>
  {/* Header */}
  <div className="header" style={{ 
    marginBottom: '30px', 
    paddingBottom: '20px', 
    borderBottom: '1px solid var(--border-color)' 
  }}>
    <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Page Title</h1>
  </div>

  {/* New Button */}
  {!showForm && (
    <button onClick={() => setShowForm(true)}>+ New Item</button>
  )}

  {/* Form */}
  {showForm && (
    <div className="card" style={{ background: 'var(--bg-card)' }}>
      {/* Form content */}
    </div>
  )}

  {/* List */}
  <div className="card" style={{ background: 'var(--bg-card)' }}>
    <table>{/* Table content */}</table>
  </div>
</div>
```

## Theme System

### ThemeProvider

The application uses React Context for theme management:

```tsx
import { ThemeProvider } from './components/ThemeContext'

<ThemeProvider>
  <App />
</ThemeProvider>
```

### Theme Toggle

Users can switch between light and dark themes:

```tsx
import ThemeToggle from './components/ThemeToggle'

<ThemeToggle />
```

The theme preference is persisted in `localStorage`.

### Applying Themes

The theme is applied by setting a `data-theme` attribute on the body:

```tsx
document.body.setAttribute('data-theme', theme)
```

CSS variables automatically update based on this attribute.

## Best Practices

### DO
- ✅ Always use CSS variables for colors
- ✅ Use `var(--bg-card)` for card backgrounds
- ✅ Use `var(--bg-input)` for input backgrounds
- ✅ Use `var(--text-primary)` for main text
- ✅ Use `var(--text-secondary)` for descriptions
- ✅ Follow the form pattern (header, card, h2, inputs, footer)
- ✅ Use `justifyContent: 'space-between'` for form footers
- ✅ Test both light and dark themes

### DON'T
- ❌ Hardcode colors like `#1a1a1a` or `#fff`
- ❌ Forget to add `style={{ background: 'var(--bg-card)' }}` to cards
- ❌ Use different spacing or padding patterns
- ❌ Mix button styles
- ❌ Skip the h2 title in forms

## Examples

### Complete Form Example

```tsx
export default function ExampleComponent({ token }: { token: string }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Submit logic
    setShowForm(false)
    setName('')
  }

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      {/* Header */}
      <div className="header" style={{ 
        marginBottom: '30px', 
        paddingBottom: '20px', 
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Example</h1>
      </div>

      {/* New Button */}
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

      {/* Form */}
      {showForm && (
        <div className="card" style={{ background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>
            New Item
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '10px' 
            }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
```

---

For more information on development practices, see [best-practices/README.md](./best-practices/README.md).