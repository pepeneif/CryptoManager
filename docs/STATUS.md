# CryptoManager - Estado del Proyecto

## Información General
- **Última actualización:** 2026-03-05
- **Tech Stack:** React + TypeScript + Vite, Express + TypeScript, SQLite, JWT Auth
- **Frontend URL:** https://studio.merkle.space
- **Backend URL:** http://localhost:3001

---

## Módulos Implementados

### 1. Wallets
- ✅ Crear wallet con nombre, tipo (crypto), moneda, y wallet address
- ✅ Listado con columnas: Nombre, Wallet address, Moneda, Balance
- ✅ Búsqueda por todas las columnas
- ✅ Sorting interactivo por columnas (asc/desc/default) - ESTÁNDAR
- ✅ Balance con sorting especial (desc → asc → default)
- ✅ Campo wallet_address guardado en DB

### 2. Clientes
- Módulo de gestión de clientes

### 3. Proveedores
- Módulo de gestión de proveedores

### 4. Facturas
- ✅ Crear factura (solo ventas)
- ✅ Número de factura auto-incremental
- ✅ Campos de fecha: "Fecha de factura" y "Fecha de pago" (fecha límite)
- ✅ Moneda en dropdown desde /api/coins
- ✅ Cliente en dropdown desde /api/empresas/{id}/clientes
- ✅ Items con descripción, cantidad, precio unitario, total
- ✅ Total calculado automáticamente
- ✅ Lista: Número, Cliente, Fecha Factura, Fecha Vencimiento, Monto, Estado, Acciones
- ✅ Acciones: Pagada, Cancelada, Repetir (copia datos)
- ✅ Sorting por columnas
- ⚠️ Estándar de sorting pendiente de homogeneizar con Wallets

### 5. Pagos
- ✅ Placeholder "Módulo de pagos en desarrollo..."

### 6. Tasks (antes Autorizaciones)
- Componente Tasks

### 7. Reportes
- ✅ Placeholder "Módulo de reportes en desarrollo..."

### 0. Configuración (antes Settings)
- ✅ Sidebar label: "Configuracion"
- Sub-secciones: Usuarios, Grupos, Datos de Empresa, Coins y Tokens, Preferencias

---

## Sidebar
- ✅ Título: "CryptoManager" (usa var(--text-primary))
- ✅ Item 0: "0. Configuracion"
- ✅ Item 5: "5. Pagos"
- ✅ Item 6: "6. Tasks"

---

## Credenciales
- **Usuario:** admin
- **Password:** admin

---

## Estándar de Sorting (a implementar en todos los listados)
- **Default:** Ascendente por primera columna (ej: número, nombre)
- **Click header:** 
  - Para texto/número: asc → desc → default
  - Para monto: desc → asc → default
- **Indicador visual:** Solo mostrar ↑/↓ cuando sorting activo
- **Colores:** Encabezados con color var(--text-primary), cursor pointer

---

## Tareas Pendientes
- [ ] Estandarizar sorting en todos los listados
- [ ] Implementar responsive design
- [ ] Fix font size campo Total en facturas
- [ ] Implementar módulo de Pagos completo
- [ ] Implementar módulo de Reportes completo
- [ ] Completar i18n

---

## Integración Wallet (Planificado)
- Stack recomendado: wagmi + RainbowKit + viem
- Schema DB preparado: wallet-schema.sql
- Endpoint API: prepareTransaction.ts
- UI de pagos: Pagos.tsx
- Servicio verificación on-chain: onchain-verification.ts

---

## Notas de Desarrollo
- Para tareas de código: usar minimax (más económico)
- Tokens de confianza del CEO: ver docs/IMPLEMENTATION_PAPERCLIP.md en AROs