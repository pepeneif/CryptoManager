# Cashu Wallet - Documentación para Jose

## ¿Qué es Cashu?

Cashu es un protocolo de **ecash** para Bitcoin. Permite:
- **Privacidad**: Las transacciones son fungibles y no rastreables
- **Rapidez**: Sin confirmación de blockchain para tokens
- **Auto-custodia**: Tú controlas tus claves (nadie puede froze tus fondos)

### Conceptos básicos

```
┌─────────────────────────────────────────────────────────────┐
│                     PROTOCOLO CASHU                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. MINT (Minter)                                           │
│     └─> Emite tokens a cambio de sats                       │
│     └─> Ej: https://testnut.cashu.space                     │
│                                                             │
│  2. TOKEN                                                   │
│     └─> Representa valor (como un billete digital)          │
│     └─> Contiene "proofs" firmados por el mint              │
│     └─> Se puede enviar offline (como dinero en efectivo)   │
│                                                             │
│  3. WALLET                                                  │
│     └─> Tu aplicación para manejar tokens                   │
│     └─> Genera send/receive, crea invoices                  │
│                                                             │
│  FLUJO:                                                     │
│                                                             │
│  [Minter] ──mint──> [Token] ──send──> [Otro Wallet]        │
│      ↑                    │                                  │
│      └────── melt ────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Estructura del Módulo

```
src/services/cashu/
│
├── index.ts              # Exports principales
│
├── secureStorage.ts      # Cifrado y almacenamiento
│   ├── AES-256-GCM       # Cifrado de mnemonic
│   ├── PBKDF2            # Derivación de clave (100k iteraciones)
│   └── IndexedDB         # Almacenamiento en navegador
│
├── walletService.ts      # Lógica de wallet
│   ├── createWallet()    # Crear wallet nueva
│   ├── unlockWallet()    # Desbloquear existente
│   ├── send()            # Enviar tokens
│   ├── receive()         # Recibir tokens
│   ├── createInvoice()    # Crear invoice para recibir
│   └── exportToCSV()     # Exportar historial
│
├── useCashuWallet.ts     # React Hook
│
└── components/           # Componentes UI
    ├── CashuWalletProvider.tsx  # Context provider
    ├── WalletScreen.tsx       # Pantalla completa
    ├── WalletSetup.tsx        # Login/crear wallet
    ├── SendPayment.tsx        # Modal enviar
    ├── ReceivePayment.tsx     # Modal recibir
    ├── CreateInvoice.tsx      # Modal crear invoice
    ├── TransactionList.tsx    # Lista transacciones
    └── InvoiceList.tsx        # Lista invoices
```

## Uso Standalone (Sin React)

Útil para testing, scripts, o integrar en backend:

```typescript
import { cashuWallet, secureStorage } from './services/cashu';

async function ejemplo() {
  // 1. Inicializar
  await cashuWallet.init();

  // 2. Crear wallet
  const walletId = await cashuWallet.createWallet(
    'Mi Wallet',           // nombre
    'password123',          // contraseña
  );
  // También puedes importar un mnemonic existente:
  // await cashuWallet.createWallet('Wallet Importada', 'pass', 'word1 word2 ...');

  // 3. Enviar pago (genera token para entregar)
  const { token, transaction } = await cashuWallet.send(
    1000,                        // cantidad en sats
    'Pago a Juan por hosting',   // memo (opcional)
    'npub1abc...',               // counterparty (opcional)
  );
  console.log('Token para enviar:', token);

  // 4. Recibir pago (cobar token)
  const { amount, transaction: tx } = await cashuWallet.receive(
    token,                        // token a cobrar
    'Pago de María',              // memo personal (opcional)
    'npub1xyz...',               // payer (opcional)
  );

  // 5. Crear invoice (para que alguien te pague)
  const invoice = await cashuWallet.createInvoice(
    5000,                        // cantidad deseada
    'Hosting mensual v2',        // descripción
    undefined,                    // payer específico (opcional)
    3600                         // expires en 1 hora
  );

  // 6. Ver balance
  console.log('Balance:', cashuWallet.getBalance());

  // 7. Historial
  const txs = cashuWallet.getTransactions({ type: 'receive', limit: 50 });
  const invoices = cashuWallet.getInvoices({ status: 'pending' });

  // 8. Exportar
  const csv = cashuWallet.exportToCSV();
  const json = cashuWallet.exportToJSON();

  // 9. Importar
  const result = await cashuWallet.importFromJSON(jsonString);

  // 10. Bloquear
  cashuWallet.lockWallet();
}
```

## Uso con React (Integración en CryptoManager)

### Opción 1: Pantalla completa lista

```tsx
// En tu App.tsx o donde quieras mostrar el wallet
import { CashuWalletProvider, WalletScreen } from './services/cashu';

function App() {
  return (
    <CashuWalletProvider
      onPaymentReceived={(amount, memo) => {
        console.log(`Recibiste ${amount} sats: ${memo}`);
        // Notificar al usuario, actualizar UI, etc.
      }}
    >
      <div className="app">
        <h1>CryptoManager</h1>
        <WalletScreen />
      </div>
    </CashuWalletProvider>
  );
}
```

### Opción 2: Componentes individuales

```tsx
import { 
  CashuWalletProvider, 
  useCashuWalletContext 
} from './services/cashu';

// Envuelve toda la app
function App() {
  return (
    <CashuWalletProvider>
      <Dashboard />
    </CashuWalletProvider>
  );
}

// Usa en cualquier componente
function BalanceDisplay() {
  const { balance, isUnlocked } = useCashuWalletContext();
  
  if (!isUnlocked) {
    return <div>Wallet bloqueada</div>;
  }
  
  return (
    <div className="balance">
      {balance.toLocaleString()} sats
    </div>
  );
}

// Botón de enviar en tu toolbar
function SendButton() {
  const { send } = useCashuWalletContext();
  
  async function handlePay() {
    const { token } = await send(100, 'Donación');
    // Copiar token o mostrar QR
    await navigator.clipboard.writeText(token);
    alert('Token copiado');
  }
  
  return <button onClick={handlePay}>Enviar</button>;
}

// Widget de facturas pendientes
function PendingInvoicesWidget() {
  const { invoices, markInvoicePaid } = useCashuWalletContext();
  
  const pending = invoices.filter(i => i.status === 'pending');
  
  return (
    <div className="widget">
      <h3>Facturas Pendientes ({pending.length})</h3>
      {pending.map(inv => (
        <div key={inv.id} className="invoice">
          <span>{inv.amount} sats</span>
          <span>{inv.memo}</span>
        </div>
      ))}
    </div>
  );
}
```

### Opción 3: Integración parcial

Puedes usar solo los servicios sin la UI:

```tsx
import { cashuWallet } from './services/cashu';

// En tu componente de reportes
function CryptoExpenses() {
  const [expenses, setExpenses] = useState([]);
  
  useEffect(() => {
    // Obtener transacciones de CryptoManager
    const txs = cashuWallet.getTransactions({ type: 'send' });
    
    // Filtrar solo las del mes
    const thisMonth = txs.filter(tx => {
      const date = new Date(tx.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth();
    });
    
    setExpenses(thisMonth);
  }, []);
  
  // Generar CSV para reporte
  function exportExpenses() {
    const csv = cashuWallet.exportToCSV();
    downloadFile(csv, 'expenses.csv');
  }
  
  return (
    <div>
      <h2>Gastos Crypto del Mes</h2>
      <button onClick={exportExpenses}>Exportar CSV</button>
      {/* ... renderizar lista */}
    </div>
  );
}
```

## Seguridad

### Cómo funciona el cifrado

```
┌─────────────────────────────────────────────────────────────┐
│                    SEGURIDAD DEL WALLET                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Mnemonic (Seed Phrase)                                  │
│     └─> 12 o 24 palabras BIP39                              │
│     └─> Genera todas tus claves                              │
│     └─> SI LA PIERDES, PIERDES TODO                         │
│                                                             │
│  2. Password ──PBKDF2──> Clave AES                          │
│     └─> 100,000 iteraciones                                 │
│     └─> SHA-256 hash                                        │
│     └─> Salt único por wallet                               │
│                                                             │
│  3. Mnemonic ──AES-256-GCM──> Datos encriptados             │
│     └─> IV aleatorio de 12 bytes                            │
│     └─> Guardado en IndexedDB                               │
│                                                             │
│  DIAGRAMA:                                                  │
│                                                             │
│  ┌──────────┐    PBKDF2      ┌──────────┐                  │
│  │ Password │ ─────────────> │ AES Key  │                  │
│  └──────────┘  100k iter.    └──────────┘                  │
│       │                            │                        │
│       │                            │ AES-256-GCM            │
│       ▼                            ▼                        │
│  ┌──────────┐                 ┌──────────┐                  │
│  │ Mnemonic │ ─────────────────>│ Encrypted│                 │
│  └──────────┘                 └──────────┘                  │
│                                    │                        │
│                                    ▼                        │
│                              IndexedDB                      │
│                                                             │
│  PARA DESBLOQUEAR:                                          │
│  Password + Datos → PBKDF2 → Derivar clave → Desencriptar   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Recomendaciones

1. **Nunca guardes el mnemonic en texto plano**
2. **Usa passwords fuertes** (mínimo 8 caracteres, mezcla mayúsculas/números)
3. **Haz backup del mnemonic** en papel, en lugar seguro
4. **No compartas tokens** con nadie que no confíes

## Memos y追踪

Los **memos** son notas que puedes agregar a transacciones:

```typescript
// Buenos usos de memos:
await cashuWallet.send(1000, 'Pago a Juan por consultoría');
await cashuWallet.receive(token, 'Pago de María - Freelance Dic');
await cashuWallet.createInvoice(5000, 'Hosting VPS mensual - cliente X');

// Búsqueda por memo:
const txs = cashuWallet.searchByMemo('Juan');
// Retorna todas las transacciones con "Juan" en el memo
```

## Exportar/Importar Datos

```typescript
// Exportar todo
const csv = cashuWallet.exportToCSV();
const json = cashuWallet.exportToJSON();

// Importar en otra instancia
const result = await cashuWallet.importFromJSON(jsonString);
console.log(`${result.transactionsImported} txs importadas`);

// Para backup externo:
// 1. Exporta JSON
// 2. Guarda en archivo seguro
// 3. Para restaurar, usa importFromJSON()
```

## Formato CSV Exportado

```csv
Date,Type,Amount (sats),Memo,Counterparty,Status,Invoice ID
2024-03-28T10:30:00.000Z,receive,5000,Pago de María,npub1xyz...,completed,
2024-03-28T09:15:00.000Z,send,1000,Pago a Juan,,completed,
2024-03-27T14:00:00.000Z,mint,10000,Recarga,,completed,
```

## Mints Soportados

Por defecto usamos estos mints de prueba:

```typescript
const DEFAULT_MINTS = [
  'https://testnut.cashu.space',  // Testnet público
  'https://mint.minibits.cash',   // Mainnet
];

// En producción, puedes configurar tu mint preferido:
await cashuWallet.setDefaultMint('https://tu-mint.com');
```

⚠️ **Nota**: Los tokens Cashu son específicos del mint que los emitió. 
No puedes cobrar un token de mint A en wallet de mint B.

## Próximos Pasos para Integrar en CryptoManager

1. **Importar el provider** en tu `App.tsx`
2. **Decidir integración**:
   - Opción A: Usar `<WalletScreen />` completo
   - Opción B: Widgets individuales (balance, historial)
3. **Conectar con backend** existente:
   - Las facturas pueden crear invoices en tu sistema
   - El historial puede exportarse para reportes
4. **Personalizar estilos** (ver sección de CSS)

## CSS Necesario

Los componentes esperan estas clases CSS:

```css
/* Contenedor principal */
.cashu-wallet { /* ... */ }

/* Balance */
.balance-amount { font-size: 2rem; font-weight: bold; }

/* Botones */
.action-btn { /* acciones principales */ }
.primary-btn { /* botón principal */ }
.secondary-btn { /* botón secundario */ }

/* Modal */
.modal-overlay { /* overlay oscuro */ }
.modal { /* caja del modal */ }

/* Listas */
.transaction-item { /* item de transacción */ }
.invoice-item { /* item de invoice */ }

/* Estados */
.badge.pending { background: #fef3c7; }
.badge.paid { background: #d1fae5; }
.badge.expired { background: #fee2e2; }
```

Los componentes usan clases simples. Puedes sobreescribir con tu CSS de CryptoManager.

---

¿Dudas? Pregunta específico y te explico.
