# Configuración de Variables de Entorno

## Visión General

CryptoManager usa variables de entorno para configuración. El archivo `.env.example` contiene todas las variables disponibles con valores por defecto seguros para desarrollo local.

## Archivo `.env`

Copia `.env.example` a `.env` y configura los valores:

```bash
cp .env.example .env
```

## Variables Disponibles

### Configuración del Servidor

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | 3001 | Puerto del servidor backend |
| `NODE_ENV` | development | Entorno: development, production |
| `JWT_SECRET` | (generado) | Clave secreta para tokens JWT |
| `DATABASE_URL` | ./data/manager.db | Ruta a la base de datos SQLite |
| `FRONTEND_URL` | http://localhost:3000 | URL del frontend (para CORS) |

### URLs RPC de Blockchains

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ETH_RPC_URL` | (Alchemy demo) | RPC de Ethereum |
| `POLY_RPC_URL` | (Alchemy demo) | RPC de Polygon |
| `ARBI_RPC_URL` | (Alchemy demo) | RPC de Arbitrum |
| `OPTI_RPC_URL` | (Alchemy demo) | RPC de Optimism |
| `BSC_RPC_URL` | (Binance) | RPC de BSC |

**Cómo obtener URLs RPC:**
- [Alchemy](https://alchemy.com) - Gratis, requiere registro
- [Infura](https://infura.io) - Gratis, requiere registro
- [QuickNode](https://quicknode.com) - Gratis tier disponible

### API Keys de Explorers

| Variable | Descripción |
|----------|-------------|
| `ETHERSCAN_API_KEY` | API key de Etherscan (Ethereum) |
| `POLYGONSCAN_API_KEY` | API key de Polygonscan (Polygon) |
| `ARBISCAN_API_KEY` | API key de Arbiscan (Arbitrum) |
| `BSCSCAN_API_KEY` | API key de BscScan (BSC) |

**Cómo obtener API keys:**
1. Crear cuenta en el explorer correspondiente
2. Ir a API Keys section
3. Crear nueva API key

### Precios (optional)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `COINGECKO_API_URL` | api.coingecko.com | Endpoint de precios |

## Desarrollo Local

Para desarrollo local, los valores por defecto funcionan sin necesidad de configurar nada. Solo necesitas:

```bash
cp .env.example .env
npm install
npm run dev
```

## Producción

Para producción, **DEBES** configurar:

1. `JWT_SECRET` - Genera una clave segura
2. URLs RPC propias (no uses los demos)
3. API keys de explorers si usas verificación on-chain

## Tipo TypeScript

Para usar las env vars con tipo en TypeScript:

```typescript
// types/env.d.ts
interface EnvVars {
  PORT: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  ETH_RPC_URL: string;
  POLY_RPC_URL: string;
  // ... otras vars
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVars {}
  }
}
```