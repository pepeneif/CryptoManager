-- Wallet Integration Schema for CryptoManager

-- ============================================================================
-- Tabla de wallets registradas por grupo/empresa
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    address VARCHAR(255) NOT NULL,
    wallet_type VARCHAR(50) NOT NULL, -- 'metamask', 'phantom', 'coinbase', etc.
    blockchain VARCHAR(50) NOT NULL,  -- 'ethereum', 'polygon', 'solana', 'arbitrum', etc.
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    UNIQUE(group_id, address, blockchain)
);

CREATE INDEX idx_wallets_group ON wallets(group_id);
CREATE INDEX idx_wallets_address ON wallets(address);

-- ============================================================================
-- Tabla de autorizaciones de pago
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_authorizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    
    -- Datos del pago
    amount VARCHAR(100) NOT NULL, -- Wei para EVM, lamports para Solana
    token_address VARCHAR(255),   -- NULL para nativo (ETH, SOL)
    token_symbol VARCHAR(20) NOT NULL,
    token_decimals INTEGER NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255),
    blockchain VARCHAR(50) NOT NULL,
    
    -- Referencias
    invoice_id INTEGER,
    description TEXT,
    reference VARCHAR(255),
    
    -- Workflow
    status VARCHAR(20) DEFAULT 'pending', -- pending, authorized, rejected, signed, failed
    created_by INTEGER NOT NULL,          -- user_id quien lo creó
    authorized_by INTEGER,                -- user_id quien autorizó
    authorized_at DATETIME,
    rejected_by INTEGER,
    rejected_at DATETIME,
    rejection_reason TEXT,
    
    -- Firma
    signed_tx_hash VARCHAR(255),
    signed_at DATETIME,
    wallet_id INTEGER,
    gas_used VARCHAR(50),
    gas_cost VARCHAR(50),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (authorized_by) REFERENCES users(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE INDEX idx_authorizations_group ON payment_authorizations(group_id);
CREATE INDEX idx_authorizations_status ON payment_authorizations(status);
CREATE INDEX idx_authorizations_created_by ON payment_authorizations(created_by);
CREATE INDEX idx_authorizations_destination ON payment_authorizations(destination_address);

-- ============================================================================
-- Tabla de checkpoints de saldo (para reconciliación)
-- ============================================================================
CREATE TABLE IF NOT EXISTS balance_checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id INTEGER NOT NULL,
    
    -- Balance
    balance VARCHAR(100) NOT NULL, -- Wei/lamports
    balance_usd DECIMAL(20, 2),
    
    -- Contexto del checkpoint
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(255),
    block_timestamp DATETIME NOT NULL,
    
    -- Metadata
    is_reconciled BOOLEAN DEFAULT 0,
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE INDEX idx_checkpoints_wallet ON balance_checkpoints(wallet_id);
CREATE INDEX idx_checkpoints_timestamp ON balance_checkpoints(block_timestamp);

-- ============================================================================
-- Tabla de transacciones verificadas on-chain
-- ============================================================================
CREATE TABLE IF NOT EXISTS verified_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Datos de la TX on-chain
    tx_hash VARCHAR(255) NOT NULL,
    wallet_id INTEGER NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp DATETIME NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255),
    amount VARCHAR(100) NOT NULL,
    token_address VARCHAR(255), -- NULL si es nativo
    token_symbol VARCHAR(20),
    token_decimals INTEGER,
    gas_used VARCHAR(50),
    gas_price VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    
    -- Reconciliación
    is_reconciled BOOLEAN DEFAULT 0,
    reconciled_with_authorization_id INTEGER,
    reconciled_at DATETIME,
    reconciliation_notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (reconciled_with_authorization_id) REFERENCES payment_authorizations(id)
);

CREATE INDEX idx_verified_tx_hash ON verified_transactions(tx_hash);
CREATE INDEX idx_verified_wallet ON verified_transactions(wallet_id);
CREATE INDEX idx_verified_timestamp ON verified_transactions(block_timestamp);
CREATE INDEX idx_verified_reconciled ON verified_transactions(is_reconciled);

-- ============================================================================
-- Tabla de configuración de explorers por blockchain
-- ============================================================================
CREATE TABLE IF NOT EXISTS blockchain_explorers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blockchain VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    explorer_url VARCHAR(255) NOT NULL,
    api_url VARCHAR(255),
    api_key VARCHAR(255),
    is_active BOOLEAN DEFAULT 1
);

-- Datos por defecto
INSERT OR IGNORE INTO blockchain_explorers (blockchain, name, explorer_url, api_url) VALUES
('ethereum', 'Etherscan', 'https://etherscan.io', 'https://api.etherscan.io/api'),
('polygon', 'Polygonscan', 'https://polygonscan.com', 'https://api.polygonscan.com/api'),
('arbitrum', 'Arbiscan', 'https://arbiscan.io', 'https://api.arbiscan.io/api'),
('optimism', 'Optimism Explorer', 'https://optimistic.etherscan.io', 'https://api-optimistic.etherscan.io/api'),
('bsc', 'BscScan', 'https://bscscan.com', 'https://api.bscscan.com/api'),
('solana', 'Solana Explorer', 'https://solscan.io', 'https://api.solscan.io');