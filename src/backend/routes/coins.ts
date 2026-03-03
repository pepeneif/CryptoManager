import { Router } from 'express'
import { db } from '../db.js'

// Type for database rows
interface CoinRow {
  id: number
  symbol: string
  name: string
  blockchain: string
  type: string
  enabled: number
  is_custom: number
  created_at: string
}

const router = Router()

// GET /api/coins - Listar todas las coins (con filtros opcionales)
router.get('/coins', (req, res) => {
  try {
    const { enabled, type, blockchain } = req.query
    
    let query = 'SELECT * FROM coins WHERE 1=1'
    const params: any[] = []

    if (enabled !== undefined) {
      query += ' AND enabled = ?'
      params.push(enabled === 'true' ? 1 : 0)
    }

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    if (blockchain) {
      query += ' AND blockchain = ?'
      params.push(blockchain)
    }

    query += ' ORDER BY is_custom DESC, name ASC'

    const coins = db.prepare(query).all(...params)
    res.json(coins)
  } catch (err) {
    console.error('Error fetching coins:', err)
    res.status(500).json({ error: 'Error al obtener coins' })
  }
})

// GET /api/coins/:id - Obtener una coin por ID
router.get('/coins/:id', (req, res) => {
  try {
    const coin = db.prepare('SELECT * FROM coins WHERE id = ?').get(req.params.id)
    if (!coin) {
      return res.status(404).json({ error: 'Coin no encontrada' })
    }
    res.json(coin)
  } catch (err) {
    console.error('Error fetching coin:', err)
    res.status(500).json({ error: 'Error al obtener coin' })
  }
})

// POST /api/coins - Crear nueva coin
router.post('/coins', (req, res) => {
  try {
    const { symbol, name, blockchain, type = 'token', enabled = true, is_custom = false } = req.body

    if (!symbol || !name || !blockchain) {
      return res.status(400).json({ error: 'Faltan campos requeridos: symbol, name, blockchain' })
    }

    const upperSymbol = symbol.toUpperCase()
    const upperBlockchain = blockchain.toUpperCase()
    const coinType = ['coin', 'token', 'stablecoin'].includes(type) ? type : 'token'

    // Check if already exists
    const existing = db.prepare('SELECT id FROM coins WHERE symbol = ? AND blockchain = ?').get(upperSymbol, upperBlockchain)
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una coin con este símbolo y blockchain' })
    }

    const result = db.prepare(`
      INSERT INTO coins (symbol, name, blockchain, type, enabled, is_custom)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(upperSymbol, name, upperBlockchain, coinType, enabled ? 1 : 0, is_custom ? 1 : 0)

    const newCoin = db.prepare('SELECT * FROM coins WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newCoin)
  } catch (err) {
    console.error('Error creating coin:', err)
    res.status(500).json({ error: 'Error al crear coin' })
  }
})

// PUT /api/coins/:id - Actualizar coin
router.put('/coins/:id', (req, res) => {
  try {
    const { id } = req.params
    const { symbol, name, blockchain, type, enabled } = req.body

    const existing = db.prepare('SELECT * FROM coins WHERE id = ?').get(id) as CoinRow | undefined
    if (!existing) {
      return res.status(404).json({ error: 'Coin no encontrada' })
    }

    const upperSymbol = symbol ? symbol.toUpperCase() : existing.symbol
    const upperBlockchain = blockchain ? blockchain.toUpperCase() : existing.blockchain
    const coinType = type && ['coin', 'token', 'stablecoin'].includes(type) ? type : existing.type

    // Check duplicate if changing symbol/blockchain
    if (symbol || blockchain) {
      const duplicate = db.prepare('SELECT id FROM coins WHERE symbol = ? AND blockchain = ? AND id != ?')
        .get(upperSymbol, upperBlockchain, id)
      if (duplicate) {
        return res.status(409).json({ error: 'Ya existe otra coin con este símbolo y blockchain' })
      }
    }

    db.prepare(`
      UPDATE coins 
      SET symbol = ?, name = ?, blockchain = ?, type = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(upperSymbol, name || (existing as CoinRow).name, upperBlockchain, coinType, enabled !== undefined ? (enabled ? 1 : 0) : (existing as CoinRow).enabled, id)

    const updatedCoin = db.prepare('SELECT * FROM coins WHERE id = ?').get(id)
    res.json(updatedCoin)
  } catch (err) {
    console.error('Error updating coin:', err)
    res.status(500).json({ error: 'Error al actualizar coin' })
  }
})

// PATCH /api/coins/:id/toggle - Toggle enabled status
router.patch('/coins/:id/toggle', (req, res) => {
  try {
    const { id } = req.params

    const existing = db.prepare('SELECT * FROM coins WHERE id = ?').get(id) as CoinRow | undefined
    if (!existing) {
      return res.status(404).json({ error: 'Coin no encontrada' })
    }

    const newEnabled = existing.enabled ? 0 : 1
    db.prepare('UPDATE coins SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newEnabled, id)

    const updatedCoin = db.prepare('SELECT * FROM coins WHERE id = ?').get(id)
    res.json(updatedCoin)
  } catch (err) {
    console.error('Error toggling coin:', err)
    res.status(500).json({ error: 'Error al togglear coin' })
  }
})

// DELETE /api/coins/:id - Eliminar coin
router.delete('/coins/:id', (req, res) => {
  try {
    const { id } = req.params

    const existing = db.prepare('SELECT * FROM coins WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: 'Coin no encontrada' })
    }

    db.prepare('DELETE FROM coins WHERE id = ?').run(id)
    res.json({ success: true, message: 'Coin eliminada' })
  } catch (err) {
    console.error('Error deleting coin:', err)
    res.status(500).json({ error: 'Error al eliminar coin' })
  }
})

// Seed default coins if table is empty
const coinCount = db.prepare('SELECT COUNT(*) as count FROM coins').get() as { count: number }
if (coinCount.count === 0) {
  const defaultCoins = [
    { symbol: 'BTC', name: 'Bitcoin', blockchain: 'BTC', type: 'coin' },
    { symbol: 'ETH', name: 'Ethereum', blockchain: 'ETH', type: 'coin' },
    { symbol: 'SOL', name: 'Solana', blockchain: 'SOL', type: 'coin' },
    { symbol: 'USDT', name: 'Tether', blockchain: 'ETH', type: 'stablecoin' },
    { symbol: 'USDC', name: 'USD Coin', blockchain: 'ETH', type: 'stablecoin' },
    { symbol: 'DAI', name: 'Dai', blockchain: 'ETH', type: 'stablecoin' },
  ]

  const insertStmt = db.prepare('INSERT INTO coins (symbol, name, blockchain, type, enabled, is_custom) VALUES (?, ?, ?, ?, 1, 0)')
  for (const coin of defaultCoins) {
    insertStmt.run(coin.symbol, coin.name, coin.blockchain, coin.type)
  }
  console.log('✅ Default coins seeded')
}

// --- Exchange Rates Routes ---

// GET /api/exchange-rates - Listar rates
router.get('/exchange-rates', (req, res) => {
  try {
    const { from, to } = req.query

    let query = 'SELECT * FROM exchange_rates WHERE 1=1'
    const params: any[] = []

    if (from) {
      query += ' AND from_currency = ?'
      params.push(from.toString().toUpperCase())
    }

    if (to) {
      query += ' AND to_currency = ?'
      params.push(to.toString().toUpperCase())
    }

    query += ' ORDER BY fetched_at DESC'

    const rates = db.prepare(query).all(...params)
    res.json(rates)
  } catch (err) {
    console.error('Error fetching exchange rates:', err)
    res.status(500).json({ error: 'Error al obtener rates' })
  }
})

// GET /api/exchange-rates/:from/:to - Obtener rate específico
router.get('/exchange-rates/:from/:to', (req, res) => {
  try {
    const { from, to } = req.params
    const rate = db.prepare('SELECT * FROM exchange_rates WHERE from_currency = ? AND to_currency = ?')
      .get(from.toUpperCase(), to.toUpperCase())
    
    if (!rate) {
      return res.status(404).json({ error: 'Rate no encontrada' })
    }
    res.json(rate)
  } catch (err) {
    console.error('Error fetching exchange rate:', err)
    res.status(500).json({ error: 'Error al obtener rate' })
  }
})

// POST /api/exchange-rates - Crear/actualizar rate
router.post('/exchange-rates', (req, res) => {
  try {
    const { from_currency, to_currency, rate, source = 'manual' } = req.body

    if (!from_currency || !to_currency || rate === undefined) {
      return res.status(400).json({ error: 'Faltan campos requeridos: from_currency, to_currency, rate' })
    }

    const from = from_currency.toUpperCase()
    const to = to_currency.toUpperCase()

    // Upsert - insert or update
    db.prepare(`
      INSERT INTO exchange_rates (from_currency, to_currency, rate, source, fetched_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(from_currency, to_currency) DO UPDATE SET 
        rate = excluded.rate,
        source = excluded.source,
        fetched_at = CURRENT_TIMESTAMP
    `).run(from, to, rate, source)

    const updatedRate = db.prepare('SELECT * FROM exchange_rates WHERE from_currency = ? AND to_currency = ?').get(from, to)
    res.json(updatedRate)
  } catch (err) {
    console.error('Error saving exchange rate:', err)
    res.status(500).json({ error: 'Error al guardar rate' })
  }
})

// DELETE /api/exchange-rates/:from/:to - Eliminar rate
router.delete('/exchange-rates/:from/:to', (req, res) => {
  try {
    const { from, to } = req.params

    const result = db.prepare('DELETE FROM exchange_rates WHERE from_currency = ? AND to_currency = ?')
      .run(from.toUpperCase(), to.toUpperCase())

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Rate no encontrada' })
    }

    res.json({ success: true, message: 'Rate eliminada' })
  } catch (err) {
    console.error('Error deleting exchange rate:', err)
    res.status(500).json({ error: 'Error al eliminar rate' })
  }
})

export default router
