# Plan de Implementación - Sistema de Transacciones

## Fase 1: Fundamentos (Semana 1)

### Objetivo
Establecer la base de datos, tipos, y servicios core para generar transacciones en EVM chains.

### Tareas Detalladas

#### 1.1 Esquema de Base de Datos
```sql
-- Tabla principal de transacciones
CREATE TABLE blockchain_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER NOT NULL,
  cuenta_id INTEGER NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'draft',
  blockchain TEXT NOT NULL,
  network TEXT DEFAULT 'mainnet',
  tx_type TEXT DEFAULT 'transfer',
  tx_data TEXT NOT NULL,
  nonce INTEGER,
  use_future_nonce BOOLEAN DEFAULT 0,
  broadcast_after DATETIME,
  gas_price TEXT,
  gas_limit TEXT,
  max_fee_per_gas TEXT,
  max_priority_fee_per_gas TEXT,
  total_amount TEXT,
  fee_estimate TEXT,
  description TEXT,
  reference_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  signed_at DATETIME,
  broadcast_at DATETIME,
  confirmed_at DATETIME,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
);

-- Índices
CREATE INDEX idx_tx_empresa ON blockchain_transactions(empresa_id);
CREATE INDEX idx_tx_status ON blockchain_transactions(status);
CREATE INDEX idx_tx_cuenta ON blockchain_transactions(cuenta_id);
```

#### 1.2 Instalación de Dependencias
```bash
npm install ethers@6 @solana/web3.js bitcoinjs-lib @types/node
npm install qrcode @types/qrcode  # Para QR codes
npm install @walletconnect/ethereum-provider  # Para WalletConnect
```

#### 1.3 Estructura de Directorios
```
src/
├── blockchain/
│   ├── types.ts           # Tipos compartidos
│   ├── constants.ts       # Constantes por chain
│   ├── services/
│   │   ├── BaseService.ts
│   │   ├── EVMService.ts
│   │   ├── SolanaService.ts
│   │   └── BitcoinService.ts
│   └── adapters/
│       ├── WalletAdapter.ts
│       ├── MetaMaskAdapter.ts
│       ├── PhantomAdapter.ts
│       └── SparrowAdapter.ts
├── backend/
│   └── routes/
│       └── transactions.ts
└── components/
    └── transactions/
        ├── TransactionBuilder.tsx
        ├── WalletConnector.tsx
        └── BatchPaymentBuilder.tsx
```

## Fase 2: Servicios Blockchain (Semana 2)

### 2.1 BaseService (Abstracto)
```typescript
export abstract class BaseBlockchainService {
  abstract readonly chainId: string;
  abstract readonly chainName: string;
  
  // Métodos abstractos
  abstract createTransfer(params: TransferParams): Promise<UnsignedTransaction>;
  abstract createBatchTransfer(params: BatchTransferParams): Promise<UnsignedTransaction>;
  abstract estimateGas(tx: UnsignedTransaction): Promise<GasEstimate>;
  abstract broadcastTx(signedTx: string): Promise<string>; // returns txHash
  abstract getNonce(address: string): Promise<number>;
  
  // Métodos comunes
  validateAddress(address: string): boolean { ... }
  formatAmount(amount: string, decimals: number): string { ... }
}
```

### 2.2 EVMService
- Implementar usando ethers.js v6
- Soportar: Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche
- Features: EIP-1559, legacy transactions, contract interactions

### 2.3 SolanaService
- Implementar usando @solana/web3.js
- Soportar: SOL transfers, SPL token transfers
- Features: Versioned transactions, priority fees

### 2.4 BitcoinService
- Implementar usando bitcoinjs-lib
- Soportar: P2WPKH, P2TR (taproot)
- Output: PSBT en base64 y hexadecimal

## Fase 3: API Backend (Semana 3)

### Endpoints a implementar:

```typescript
// POST /api/transactions
// Crea una nueva transacción
{
  "cuenta_id": 1,
  "tx_type": "transfer",
  "blockchain": "ETH",
  "recipients": [
    { "address": "0x...", "amount": "1000000000000000000" }
  ],
  "description": "Pago a proveedor",
  "use_future_nonce": false
}

// GET /api/transactions/:id
// Obtiene detalles de transacción incluyendo datos para firmar

// POST /api/transactions/:id/sign
// Registra una firma
{
  "signature": "0x...",
  "signer_address": "0x..."
}

// POST /api/transactions/:id/broadcast
// Broadcast la transacción firmada

// GET /api/transactions/pending
// Lista transacciones pendientes de firma o broadcast

// POST /api/transactions/batch
// Crea transacción batch (múltiples destinatarios)
```

## Fase 4: Frontend - Wallet Integration (Semana 4)

### 4.1 WalletConnector Component
- Detectar wallets instaladas (MetaMask, Phantom)
- Conectar/desconectar
- Mostrar address y balance

### 4.2 TransactionBuilder Component
- Formulario para crear transacciones
- Selección de wallet origen
- Input de destinatario(s)
- Preview de gas fees
- Botón "Preparar Transacción"

### 4.3 MetaMask Integration
```typescript
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const signedTx = await signer.signTransaction(txData);
```

### 4.4 Phantom Integration
```typescript
const signed = await window.phantom.solana.signTransaction(transaction);
```

## Fase 5: Bitcoin PSBT (Semana 5)

### 5.1 PSBT Generation
```typescript
const psbt = new Psbt({ network: networks.bitcoin });
psbt.addInput({
  hash: utxo.txid,
  index: utxo.vout,
  witnessUtxo: {
    script: Buffer.from(utxo.scriptPubKey, 'hex'),
    value: utxo.value,
  },
});
psbt.addOutput({
  address: recipient,
  value: amount,
});
const psbtBase64 = psbt.toBase64();
```

### 5.2 QR Code Display
- Mostrar PSBT como QR code para escanear con Sparrow
- Soporte para BIP-21 URI scheme

### 5.3 File Export/Import
- Exportar PSBT como archivo .psbt
- Importar PSBT firmado desde archivo

## Fase 6: Features Avanzadas (Semana 6+)

### 6.1 Batch Payments
- UI para agregar múltiples destinatarios
- Cálculo de ahorro en gas fees vs transacciones individuales
- Preview de la transacción batch

### 6.2 Deferred Broadcasting
- Checkbox "Firmar ahora, enviar después"
- Campo para fecha/hora de broadcast
- Background job para procesar transacciones programadas

### 6.3 Multisig Support
- Creación de wallets multisig (Gnosis Safe style)
- Co-signing flow
- Tracking de firmas recolectadas

### 6.4 DeFi Integration
- Swaps via Uniswap/Jupiter
- Lending/borrowing via Aave
- Staking

## Testing Strategy

### Unit Tests
- Servicios blockchain con mocks
- Validación de addresses
- Cálculo de fees

### Integration Tests
- Flujo completo en testnets
- Goerli (Ethereum)
- Mumbai (Polygon)
- Devnet (Solana)
- Testnet (Bitcoin)

### Manual Testing
- MetaMask en Goerli
- Phantom en devnet
- Sparrow en testnet

## Consideraciones de Seguridad

1. **No almacenar private keys**
2. **Validar todas las inputs**
3. **Usar HTTPS siempre**
4. **Rate limiting en API**
5. **Audit logging**
6. **Revisión de código antes de mainnet**
