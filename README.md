# CryptoManager

A Cryptocurrency wallet management and business accounting application for CFOs of crypto related projects and crypto-native businesses, Built with React, TypeScript, and Express.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)

## Motivation

CFOs managing crypto operations, spend hours copying and pasting wallet addresses from spreadsheets, making payments one by one, and trying to reconcile transactions in block explorers that only show cryptic addresses without context.

**The Problem:**
- Block explorers tell you *what* happened ("0x123... sent 0.5 ETH to 0xabc...") but not *why* ("Payment to Supplier XYZ for Invoice #1234")
- No easy way to organize contacts - hunting for wallet addresses in emails and spreadsheets
- Paying employees, suppliers, and investors one-by-one is tedious and expensive in gas fees
- No unified view of balances across multiple wallets and blockchains

**The Solution:**
CryptoManager bridges the gap between traditional accounting software and crypto wallets. It combines:
- **Contact Management**: Store and organize wallet addresses with business context
- **Batch Payments**: Bundle multiple payments into a single transaction to save time and gas fees
- **Transaction Context**: Every payment is tagged with purpose, invoice references, and notes
- **Multi-Chain Dashboard**: View all your wallet balances across Bitcoin, Ethereum, Solana, and more in one place
- **Invoicing**: Create professional invoices with embedded wallet addresses for easy payment

Built for crypto-native CFOs who need proper financial controls without sacrificing the benefits of decentralized finance.

## How It Works

CryptoManager connects your business operations with blockchain transactions through a streamlined, 5-step workflow.

### Workflow Overview

```mermaid
flowchart LR
    A[1. Setup Entities] --> B[2. Configure Crypto]
    B --> C[3. Operations]
    C --> D[4. Sign Securely]
    D --> E[5. Track Portfolio]
    E --> F[Unified Financial View]
    
    style A fill:#4a90d9,stroke:#333,color:#fff
    style B fill:#4a90d9,stroke:#333,color:#fff
    style C fill:#4a90d9,stroke:#333,color:#fff
    style D fill:#e74c3c,stroke:#333,color:#fff
    style E fill:#4a90d9,stroke:#333,color:#fff
    style F fill:#27ae60,stroke:#333,color:#fff
```

### Quick Reference

| Step | Phase | Key Actions | Outcome |
|------|-------|-------------|---------|
| 1️⃣ | **Entity Setup** | Register users, clients, suppliers | Organized stakeholder directory |
| 2️⃣ | **Crypto Config** | Add coins, tokens, wallet addresses | Multi-chain asset support |
| 3️⃣ | **Operations** | Create invoices, schedule payments | Business-ready transactions |
| 4️⃣ | **Secure Signing** | Review and sign with your wallet | Non-custodial execution |
| 5️⃣ | **Portfolio Tracking** | Monitor balances and history | Unified financial visibility |

---

### 1️⃣ Business Entity Setup

Establish your organizational foundation by registering key stakeholders:

| Entity | Role | Purpose |
|--------|------|---------|
| **Users** | Team members | Platform access and collaboration |
| **Clients** | Customers | Invoice recipients and payment sources |
| **Suppliers** | Vendors | Payment recipients for goods/services |

> 💡 **Tip**: Proper entity setup ensures all transactions are tagged with business context from day one.

---

### 2️⃣ Cryptocurrency Configuration

Define the digital assets your business will transact with:

**Supported Asset Types**

| Category | Examples | Use Case |
|----------|----------|----------|
| **Native Coins** | Bitcoin, Ethereum, Solana | Primary blockchain transactions |
| **Stablecoins** | USDT, USDC, DAI | Price-stable payments |
| **Tokens** | ERC-20, BEP-20, SPL | Project-specific or utility tokens |
| **Wallet Addresses** | Public addresses | Receiving and sending funds |

---

### 3️⃣ Business Operations

Execute day-to-day financial activities with full context:

| Operation | Action | Business Value |
|-----------|--------|----------------|
| **Invoicing** | Create and send invoices | Collect payments with reference numbers |
| **Payments** | Schedule supplier payments | Batch and automate outgoing transfers |
| **Tracking** | Record transaction context | Link blockchain data to business purpose |

---

### 4️⃣ Secure Transaction Signing

CryptoManager uses a **non-custodial security architecture** — you maintain full control of your assets at all times.

**How It Works**

| Stage | What CryptoManager Does | What You Do |
|-------|------------------------|-------------|
| **Prepare** | Generates transaction data with business context | Review transaction details |
| **Connect** | Integrates with wallet extensions | Connect MetaMask, Phantom, etc. |
| **Sign** | Presents data for approval | Sign with your private keys |
| **Broadcast** | Submits to blockchain network | Confirm on-chain execution |

> ⚠️ **Security Guarantee**: Your private keys **never** leave your wallet. CryptoManager only prepares transaction data — you hold the signing authority.

---

### 5️⃣ Unified Portfolio Tracking

Maintain complete visibility across all your crypto finances:

**Dashboard Capabilities**

| Feature | Data Source | Benefit |
|---------|-------------|---------|
| **Real-time Balances** | Blockchain explorers | Always-current asset values |
| **Multi-chain View** | Aggregated APIs | Single dashboard for all chains |
| **Fiat Conversion** | Exchange rate APIs | View in your preferred currency |
| **Contextual History** | Local database | Transaction purpose and notes |
| **Consolidated Reports** | Unified queries | Cross-wallet, cross-chain summaries |

---

### Result: Complete Financial Control

```
┌─────────────────────────────────────────────────────────────┐
│  Traditional Accounting  +  Decentralized Finance          │
│                                                            │
│  • Contact management      • Non-custodial security       │
│  • Invoice tracking        • Multi-chain support          │
│  • Payment scheduling      • Real-time balances           │
│  • Transaction context     • You control the keys         │
│                                                            │
│  = Unified crypto financial management                     │
└─────────────────────────────────────────────────────────────┘
```

**You get**: A professional financial management system that bridges traditional accounting workflows with the benefits of decentralized finance — while keeping you in **full control** of your assets.

## Features

### Business Management
- **Multi-Company/Project Support**: Manage multiple projects or companies with group sharing capabilities
- **Wallet Management**: Track wallets (Bitcoin, Ethereum, Solana, etc.) and display their balances in preferred currencies.
- **Client & Supplier CRM**: Complete customer and vendor relationship management
- **Invoicing**: Create and manage sales and purchase invoices with line items
- **Transaction Tracking**: Record Receive, Spend, and Transfer transactions
- **User Management**: Role-based access control with group permissions

### Cryptocurrency Integration
- **Multi-Chain Support**: Bitcoin, EVM chains (Ethereum, Polygon, BSC), and Solana
- **Wallet Tracking**: Monitor crypto balances and display them in preferred currencies
- **Coin Management**: Enable/disable cryptocurrencies per company
- **Price References**: Real-time exchange rates from CoinGecko and other price suppliers via API

### UI/UX
- **Professional Design**: Clean, modern interface with consistent styling
- **Dark/Light Theme**: Full theme support with CSS variables
- **Responsive Layout**: Collapsible sidebar with intuitive navigation
- **Internationalization**: Support for 5 languages (English, Spanish, Chinese, Japanese, Korean)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | Express + TypeScript |
| **Database** | SQLite (better-sqlite3) |
| **Authentication** | JWT + bcryptjs |
| **Routing** | React Router v6 |
| **Styling** | CSS Variables + Custom Components |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cryptomanager.git
cd cryptomanager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your preferred settings (optional for local development)

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Initial/Demo Credentials
- **Username**: admin
- **Password**: admin

## Project Structure

```
cryptomanager/
├── src/
│   ├── components/          # React components
│   │   ├── Layout.tsx       # Main layout with sidebar
│   │   ├── Dashboard.tsx    # Company selection
│   │   ├── Login.tsx        # Authentication
│   │   ├── Cuentas.tsx      # Wallet management
│   │   ├── Clientes.tsx     # Customer management
│   │   ├── Proveedores.tsx  # Supplier management
│   │   ├── Facturas.tsx     # Invoice management
│   │   ├── Movimientos.tsx  # Transaction tracking
│   │   ├── Usuarios.tsx     # User management
│   │   ├── Grupos.tsx       # Group management
│   │   ├── CoinsTokens.tsx  # Cryptocurrency settings
│   │   ├── Referencias.tsx  # Exchange rate settings
│   │   ├── ThemeContext.tsx # Theme provider
│   │   └── ThemeToggle.tsx  # Theme switcher
│   ├── backend/
│   │   ├── index.ts         # Express server entry
│   │   ├── db.ts            # Database schema & connection
│   │   └── routes/          # API endpoints
│   ├── i18n/                # Internationalization
│   ├── App.tsx              # Main router
│   ├── main.tsx             # React entry
│   └── index.css            # Global styles & CSS variables
├── docs/
│   ├── best-practices/      # Development guidelines
│   └── UI_GUIDE.md          # UI design system documentation
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## UI Design System

CryptoManager features a professional, consistent UI built with CSS variables for seamless theming.

### Key Design Principles

1. **CSS Variables for Theming**: All colors use CSS variables (`--bg-card`, `--text-primary`, etc.)
2. **Card-Based Layout**: Forms and content organized in cards with consistent styling
3. **Form Standardization**: All forms follow the same structure (header, inputs, footer)
4. **Sidebar Navigation**: Collapsible sidebar with active state indicators
5. **Button Consistency**: Primary and secondary buttons with standardized sizing

See [docs/UI_GUIDE.md](docs/UI_GUIDE.md) for detailed design system documentation.

### Theme Support

The application supports both light and dark themes:

```css
/* Dark Theme (default) */
--bg-primary: #242424;
--bg-secondary: #1a1a1a;
--bg-card: #1a1a1a;
--bg-input: #2a2a2a;
--text-primary: #ffffff;
--text-secondary: #888888;
--border-color: #444444;
--accent-color: #4a90d9;

/* Light Theme */
--bg-primary: #f5f5f5;
--bg-secondary: #e8e8e8;
--bg-card: #ffffff;
--bg-input: #f0f0f0;
--text-primary: #213547;
--text-secondary: #666666;
--border-color: #dddddd;
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Companies
- `GET /api/empresas` - List companies
- `POST /api/empresas` - Create company
- `GET /api/empresas/:id` - Get company details

### Wallets
- `GET /api/empresas/:id/cuentas` - List wallets
- `POST /api/empresas/:id/cuentas` - Create wallet
- `GET /api/cuentas/:id/movimientos` - Get transactions

### Clients & Suppliers
- `GET /api/empresas/:id/clientes` - List clients
- `GET /api/empresas/:id/proveedores` - List suppliers

### Invoices
- `GET /api/empresas/:id/facturas` - List invoices
- `POST /api/empresas/:id/facturas` - Create invoice

### Admin
- `GET /api/admin/usuarios` - List users
- `GET /api/admin/grupos` - List groups
- `GET /api/admin/system-config` - System configuration

## Development

### Running Tests
```bash
# TypeScript type checking
npx tsc --noEmit
```

### Building for Production
```bash
npm run build
```

### Database
The application uses SQLite with better-sqlite3. The database file is located at `data/manager.db` and is automatically created on first run. Database files are excluded from git via `.gitignore`.

### Environment Variables
Create a `.env` file from `.env.example` to customize your setup:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Backend API port |
| `JWT_SECRET` | (dev default) | Secret key for JWT tokens - **change in production** |
| `NODE_ENV` | development | Environment mode |

For local development, defaults work out of the box. For production, always set a secure `JWT_SECRET`.

### Important Development Notes

1. **Route Order Matters**: In `src/backend/index.ts`, `systemConfigRoutes` must be registered FIRST to avoid authentication issues on public endpoints.

2. **CSS Variables**: Always use CSS variables for theming. Never hardcode colors.

3. **Authentication**: All routes under `/api` require JWT authentication except `/api/auth/*` and `/api/admin/system-config`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [docs/best-practices/README.md](docs/best-practices/README.md) for development guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Manager.io](https://github.com/Manager-io/Manager)
- Cryptocurrency price data from [CoinGecko](https://www.coingecko.com/)
- Icons and UI patterns from modern accounting software best practices

---

**Note**: This is an MVP (Minimum Viable Product) version. Features are actively being developed and improved.
