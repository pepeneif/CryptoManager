# Template: Estandar Sorting para CryptoManager

## Comportamiento Estándar

### Default
- Primera columna ascendente (nombre o número)

### Click en Header
- **Texto/Números:** asc → desc → default → asc
- **Monto/Balance:** desc → asc → default → desc

### Indicador Visual
- **Sin flecha** cuando: es default O no es la columna activa
- **↑** cuando: sorting activo y dirección ascendente  
- **↓** cuando: sorting activo y dirección descendente

### Colores
- Headers: `color: 'var(--text-primary)'`, `cursor: 'pointer'`
- Sin styling especial cuando inactivo

---

## Código Template

```typescript
// Sorting types
type SortField = 'nombre' | 'email' | 'telefono' | 'direccion' | 'monto' | 'balance' | 'numero' | 'cliente' | 'fecha' | 'fecha_vencimiento' | 'estado'

// Sorting state
const [sortField, setSortField] = useState<SortField>('nombre')  // Default: primera columna
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'default'>('default')

// Handle sort click
const handleSort = (field: SortField) => {
  if (sortField === field) {
    // Para monto/balance: desc -> asc -> default -> desc
    if (field === 'monto' || field === 'balance') {
      if (sortDirection === 'desc') setSortDirection('asc')
      else if (sortDirection === 'asc') { setSortDirection('default'); setSortField('nombre') }
      else setSortDirection('desc')
    } else {
      // Para otros: asc -> desc -> default -> asc
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') { setSortDirection('default'); setSortField('nombre') }
      else setSortDirection('asc')
    }
  } else {
    setSortField(field)
    setSortDirection(field === 'monto' || field === 'balance' ? 'desc' : 'asc')
  }
}

// Get sort icon
const getSortIcon = (field: SortField) => {
  if (sortField !== field) return ''
  if (sortDirection === 'asc') return ' ↑'
  if (sortDirection === 'desc') return ' ↓'
  return ''
}

// Sort data
const sortedData = [...filteredData].sort((a, b) => {
  if (sortDirection === 'default') {
    // Default: primera columna asc
    return (a.nombre || '').localeCompare(b.nombre || '')
  }
  const direction = sortDirection === 'desc' ? -1 : 1
  switch (sortField) {
    case 'nombre': return direction * (a.nombre || '').localeCompare(b.nombre || '')
    case 'monto': return direction * ((a.monto || 0) - (b.monto || 0))
    case 'balance': return direction * ((a.balance || 0) - (b.balance || 0))
    // ... otros campos
    default: return 0
  }
})
```

## HTML Template para Headers

```tsx
<tr>
  <th style={{ color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => handleSort('nombre')}>
    Nombre{getSortIcon('nombre')}
  </th>
  <th style={{ color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => handleSort('monto')}>
    Monto{getSortIcon('monto')}
  </th>
  {/* ... */}
</tr>
```

## Uso en Components

- Wallets (Cuentas.tsx) ✅
- Facturas ✅
- Clientes ✅
- Proveedores ✅

## Aplicar a Nuevos Componentes

1. Agregar tipos y estados
2. Agregar handleSort y getSortIcon
3. Crear sortedData antes del return
4. Usar sortedData.map() en el tbody
5. Actualizar th con onClick y getSortIcon