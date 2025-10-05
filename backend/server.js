// backend/server.js
// F2Fit Wellness API - Versión limpia con Node 20

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { z } = require('zod');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// better-sqlite3 ( más rápido)
const db = new Database('./wellness.db');
console.log('✓ SQLite conectada');

// Crear tabla
db.exec(`
  CREATE TABLE IF NOT EXISTS wellness (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    physical_energy INTEGER CHECK(physical_energy BETWEEN 1 AND 5),
    emotional_state INTEGER CHECK(emotional_state BETWEEN 1 AND 5),
    notes TEXT CHECK(length(notes) <= 100),
    habits TEXT NOT NULL,
    PRIMARY KEY (user_id, date)
  )
`);

// Schema de validación
const wellnessSchema = z.object({
  user_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  physical_energy: z.number().int().min(1).max(5),
  emotional_state: z.number().int().min(1).max(5),
  notes: z.string().max(100).optional().nullable(),
  habits: z.object({
    exercise: z.boolean(),
    hydration: z.boolean(),
    sleep: z.boolean(),
    nutrition: z.boolean(),
  }),
});

// POST /api/wellness
app.post('/api/wellness', (req, res) => {
  try {
    const data = wellnessSchema.parse(req.body);

    // Validar fecha no futura
    const entryDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (entryDate > today) {
      return res.status(400).json({
        error: 'No se pueden crear registros futuros',
      });
    }

    // Upsert con better-sqlite3
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO wellness 
      (user_id, date, physical_energy, emotional_state, notes, habits)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.user_id,
      data.date,
      data.physical_energy,
      data.emotional_state,
      data.notes || null,
      JSON.stringify(data.habits)
    );

    res.status(201).json({
      success: true,
      data: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/wellness/:userId/:date
app.get('/api/wellness/:userId/:date', (req, res) => {
  const { userId, date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Formato fecha inválido (YYYY-MM-DD)',
    });
  }

  const stmt = db.prepare('SELECT * FROM wellness WHERE user_id = ? AND date = ?');
  const row = stmt.get(userId, date);

  if (!row) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  res.json({
    success: true,
    data: {
      user_id: row.user_id,
      date: row.date,
      physical_energy: row.physical_energy,
      emotional_state: row.emotional_state,
      notes: row.notes,
      habits: JSON.parse(row.habits),
    },
  });
});

// GET /api/wellness/:userId?last=7
app.get('/api/wellness/:userId', (req, res) => {
  const { userId } = req.params;
  const days = parseInt(req.query.last) || 7;

  if (days < 1 || days > 90) {
    return res.status(400).json({
      error: 'last debe estar entre 1 y 90',
    });
  }

  const stmt = db.prepare(`
    SELECT * FROM wellness 
    WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
    ORDER BY date DESC
  `);

  const rows = stmt.all(userId, days);

  const entries = rows.map((row) => ({
    user_id: row.user_id,
    date: row.date,
    physical_energy: row.physical_energy,
    emotional_state: row.emotional_state,
    notes: row.notes,
    habits: JSON.parse(row.habits),
  }));

  res.json({
    success: true,
    data: entries,
    meta: { count: entries.length, days },
  });
});

// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  F2Fit Wellness API                ║
║  http://localhost:${PORT}             ║
╚════════════════════════════════════╝
  `);
});

// Exportar para tests
module.exports = { wellnessSchema };