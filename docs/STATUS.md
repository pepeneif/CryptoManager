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
- ✅ Sorting interactivo por columnas (asc/desc/default)
- ✅ Balance con sorting especial (desc → asc → default)
- ✅ Campo wallet_address guardado en DB

### 2. Clientes
- Módulo de gestión de clientes

### 3. Proveedores
- Módulo de gestión de proveedores

### 4. Facturas
- ✅ Crear factura (solo ventas - sin selector de tipo)
- ✅ Número de factura auto-incremental
- ✅ Campos de fecha: "Fecha de factura" y "Fecha de pago" (fecha límite)
- ✅ Moneda en dropdown desde /api/coins (configuradas en Settings → Administrar Monedas)
- ✅ Items con descripción, cantidad, precio unitario, total
- ✅ Total calculado automáticamente
- ⚠️ Campo Total de items tiene fuente más grande (pendiente fix)

### 5. Pagos
- ✅ Placeholder "Módulo de pagos en desarrollo..."

### 6. Tasks (antes Autorizaciones)
- ✅ Componente heredado de Pagos.tsx original

### 7. Reportes
- ✅ Placeholder "Módulo de reportes en desarrollo..."

### 0. Configuración (antes Settings)
- ✅ Sidebar label cambiado a "Configuracion"
- Sub-secciones: Usuarios, Grupos, Datos de Empresa, Coins y Tokens, Referencias

---

## Sidebar
- ✅ Título: "CryptoManager" (usa var(--text-primary) - blanco en dark, oscuro en light)
- ✅ Item 0: "0. Configuracion"
- ✅ Item 5: "5. Pagos"
- ✅ Item 6: "6. Tasks"

---

## Credenciales
- **Usuario:** admin
- **Password:** admin

---

## Integración Wallet (Planificado)
- Stack recomendado: wagmi + RainbowKit + viem
- Schema DB preparado: wallet-schema.sql
- Endpoint API: prepareTransaction.ts
- UI de pagos: Pagos.tsx
- Servicio verificación on-chain: onchain-verification.ts

---

## Tareas Pendientes
- [ ] Fix font size campo Total en facturas
- [ ] Implementar módulo de Pagos completo
- [ ] Implementar módulo de Reportes completo
- [ ] Integrar wagmi + RainbowKit
- [ ] Configurar variables de entorno (.env)

---

## Notas de Desarrollo
- Agentes usados: gpt, kimi (para código)
- Para tareas de código futuro: usar minimax (más económico)
- Tokens de confianza del CEO: ver docs/IMPLEMENTATION_PAPERCLIP.md en AROs