import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '..', '..', 'data', 'manager.db')

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS grupos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    grupo_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
  );

  CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    grupo_id INTEGER,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
  );

  CREATE TABLE IF NOT EXISTS cuentas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    tipo TEXT DEFAULT 'cash',
    moneda TEXT DEFAULT 'USD',
    balance REAL DEFAULT 0,
    wallet_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    direccion_fisica TEXT,
    datos_fiscales TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    direccion TEXT,
    direccion_fisica TEXT,
    datos_fiscales TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    cliente_id INTEGER,
    proveedor_id INTEGER,
    numero TEXT NOT NULL,
    fecha DATE NOT NULL,
    fecha_vencimiento DATE,
    monto REAL NOT NULL,
    moneda TEXT DEFAULT 'USD',
    estado TEXT DEFAULT 'unpaid',
    descripcion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
  );

  CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    cuenta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    monto REAL NOT NULL,
    moneda TEXT DEFAULT 'USD',
    descripcion TEXT,
    fecha DATE NOT NULL,
    referencia TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
  );

  CREATE TABLE IF NOT EXISTS empresa_datos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER UNIQUE NOT NULL,
    nombre TEXT,
    nombre_comercial TEXT,
    identificacion_fiscal TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    ciudad TEXT,
    pais TEXT,
    codigo_postal TEXT,
    website TEXT,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT UNIQUE NOT NULL,
    valor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS coins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    type TEXT DEFAULT 'token' CHECK(type IN ('coin', 'token', 'stablecoin')),
    enabled INTEGER DEFAULT 1,
    is_custom INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, blockchain)
  );

  CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    source TEXT DEFAULT 'manual',
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_currency, to_currency)
  );

  CREATE TABLE IF NOT EXISTS factura_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    factura_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad REAL NOT NULL DEFAULT 1,
    precio_unitario REAL NOT NULL,
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
  );
`)

// Create default user if not exists
const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get('administrator')
if (!existingUser) {
  const hashedPassword = bcrypt.hashSync('123', 10)
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('administrator', hashedPassword, 'admin')
  console.log('✅ Default user created: administrator / 123')
}

console.log('✅ Database initialized')

// Migration: Add new columns if not exist
try {
  db.exec(`ALTER TABLE clientes ADD COLUMN direccion_fisica TEXT`)
  db.exec(`ALTER TABLE clientes ADD COLUMN datos_fiscales TEXT`)
  db.exec(`ALTER TABLE proveedores ADD COLUMN direccion_fisica TEXT`)
  db.exec(`ALTER TABLE proveedores ADD COLUMN datos_fiscales TEXT`)
} catch (e) {
  // Tables may already have these columns
}

// Migration: Add users columns if not exist
try {
  db.exec(`ALTER TABLE users ADD COLUMN enabled INTEGER DEFAULT 1`)
} catch (e) {
  // Column may already exist
}
try {
  db.exec(`ALTER TABLE users ADD COLUMN grupo_id INTEGER`)
} catch (e) {
  // Column may already exist
}

// Migration: Add created_by column to all tables for audit
const tablesToAddCreatedBy = [
  'grupos',
  'empresas', 
  'cuentas',
  'clientes',
  'proveedores',
  'facturas',
  'movimientos',
  'empresa_datos',
  'system_config',
  'factura_items'
]

for (const table of tablesToAddCreatedBy) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN created_by INTEGER`)
  } catch (e) {
    // Column may already exist
  }
}

// === INDEXES FOR QUERY OPTIMIZATION ===
// Common query patterns optimized:
// - Foreign key lookups (empresa_id, cuenta_id, cliente_id, proveedor_id, factura_id)
// - User ownership checks (user_id)
// - ORDER BY clauses (fecha)

const indexes = [
  // Empresas - user ownership checks (most common)
  'CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_empresas_grupo_id ON empresas(grupo_id)',
  
  // Cuentas - empresa lookups
  'CREATE INDEX IF NOT EXISTS idx_cuentas_empresa_id ON cuentas(empresa_id)',
  
  // Clientes - empresa lookups
  'CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON clientes(empresa_id)',
  
  // Proveedores - empresa lookups
  'CREATE INDEX IF NOT EXISTS idx_proveedores_empresa_id ON proveedores(empresa_id)',
  
  // Facturas - empresa lookups + JOINs
  'CREATE INDEX IF NOT EXISTS idx_facturas_empresa_id ON facturas(empresa_id)',
  'CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id)',
  'CREATE INDEX IF NOT EXISTS idx_facturas_proveedor_id ON facturas(proveedor_id)',
  'CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha DESC)',
  
  // Factura items - factura lookups (N+1 prevention)
  'CREATE INDEX IF NOT EXISTS idx_factura_items_factura_id ON factura_items(factura_id)',
  
  // Movimientos - empresa + cuenta lookups + ordering
  'CREATE INDEX IF NOT EXISTS idx_movimientos_empresa_id ON movimientos(empresa_id)',
  'CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta_id ON movimientos(cuenta_id)',
  'CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha DESC, id DESC)',
  
  // Users - authentication
  'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
  
  // Empresa_datos - unique constraint already exists but add index
  'CREATE INDEX IF NOT EXISTS idx_empresa_datos_empresa_id ON empresa_datos(empresa_id)',
]

for (const idx of indexes) {
  try {
    db.exec(idx)
  } catch (e) {
    // Index may already exist
  }
}

console.log('✅ Database indexes optimized')