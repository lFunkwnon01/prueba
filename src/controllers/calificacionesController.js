const { getDb } = require('../config/database');

function calificar(req, res, next) {
  try {
    const { id_apunte, puntuacion, comentario } = req.body;

    if (!id_apunte || !puntuacion) {
      return res.status(400).json({ error: 'id_apunte y puntuacion son obligatorios' });
    }

    if (puntuacion < 1 || puntuacion > 5 || !Number.isInteger(puntuacion)) {
      return res.status(400).json({ error: 'La puntuación debe ser un entero entre 1 y 5' });
    }

    const db = getDb();

    // Verificar que el apunte existe
    const apunte = db.prepare('SELECT * FROM apuntes WHERE id = ?').get(id_apunte);
    if (!apunte) {
      return res.status(404).json({ error: 'Apunte no encontrado' });
    }

    // No permitir calificarse a sí mismo
    if (apunte.id_usuario === req.user.id) {
      return res.status(400).json({ error: 'No puedes calificar tu propio apunte' });
    }

    // Verificar si ya calificó
    const existing = db.prepare(
      'SELECT id FROM calificaciones WHERE id_apunte = ? AND id_usuario = ?'
    ).get(id_apunte, req.user.id);

    if (existing) {
      // Actualizar calificación existente
      db.prepare(
        'UPDATE calificaciones SET puntuacion = ?, comentario = ?, fecha = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(puntuacion, comentario || null, existing.id);

      const updated = db.prepare('SELECT * FROM calificaciones WHERE id = ?').get(existing.id);
      return res.json({ mensaje: 'Calificación actualizada', calificacion: updated });
    }

    const result = db.prepare(
      'INSERT INTO calificaciones (id_apunte, id_usuario, puntuacion, comentario) VALUES (?, ?, ?, ?)'
    ).run(id_apunte, req.user.id, puntuacion, comentario || null);

    const calificacion = db.prepare('SELECT * FROM calificaciones WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ mensaje: 'Calificación registrada', calificacion });
  } catch (err) {
    next(err);
  }
}

function listarPorApunte(req, res, next) {
  try {
    const db = getDb();
    const { id } = req.params;

    const apunte = db.prepare('SELECT id FROM apuntes WHERE id = ?').get(id);
    if (!apunte) return res.status(404).json({ error: 'Apunte no encontrado' });

    const calificaciones = db.prepare(`
      SELECT c.*, u.nombre AS nombre_usuario
      FROM calificaciones c
      JOIN usuarios u ON c.id_usuario = u.id
      WHERE c.id_apunte = ?
      ORDER BY c.fecha DESC
    `).all(id);

    const promedio = db.prepare(
      'SELECT COALESCE(AVG(puntuacion), 0) AS promedio, COUNT(*) AS total FROM calificaciones WHERE id_apunte = ?'
    ).get(id);

    res.json({
      id_apunte: parseInt(id),
      promedio: Math.round(promedio.promedio * 100) / 100,
      total: promedio.total,
      calificaciones
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { calificar, listarPorApunte };
