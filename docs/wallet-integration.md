# Documentación CryptoManager - Wallet Integration

## Flujo General

### 1. Captura de Pagos
- Los usuarios de un grupo capturan los pagos a proveedores en el sistema
- También se capturan facturas y otros movimientos

### 2. Autorización
- Los pagos van a un área de "en espera de autorización"
- Quien autoriza no necesariamente es quien hace el pago (separación de roles)

### 3. Firma de Transacciones
- El usuario con acceso a las wallets entra a CryptoManager
- Ve los pagos autorizados
- Hace click en cada pago → abre ventana de MetaMask/Phantom/etc.
- La transacción viene pre-rellenada con monto y wallet destino
- El usuario revisa y confirma

### 4. Verificación On-Chain (Reconciliación)
- El sistema hace checkpoints periódicamente
- Visita los blockchain explorers correspondientes (según wallet, criptomoneda y blockchain)
- Compara saldos actuales con checkpoints anteriores
- Si el saldo cambió:
  - Revisa cada TX desde el último checkpoint
  - Intenta reconciliar los pagos con las facturas
  - Si no puede reconciliar bien, alerta al usuario

## Componentes Involved

### Frontend
- Panel de pagos autorizados con botón "firmar"
- Conexión con wallets del browser (injected providers)

### Backend
- API para preparar transacciones
- Sistema de autorizaciones
- Servicio de verificación on-chain

### Base de Datos
- Wallets registradas
- Autorizaciones de pago
- Checkpoints de saldo

## Tech Requerido
- Libraries de conexión: wagmi, viem, o similares
- Soporte para múltiples wallets: MetaMask, Phantom, etc.
- Integración con múltiples blockchains y tokens