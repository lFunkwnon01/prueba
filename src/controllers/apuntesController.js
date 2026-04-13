const { getDb } = require('../config/database');

function crear(req, res, next) {
  try {
    const { titulo, descripcion, contenido, archivo_url, tipo, precio, materia } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    if (tipo && !['gratis', 'pago'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo debe ser "gratis" o "pago"' });
    }

    if (tipo === 'pago' && (!precio || precio <= 0)) {
      return res.status(400).json({ error: 'Los apuntes de pago deben tener un precio mayor a 0' });
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO apuntes (titulo, descripcion, contenido, archivo_url, tipo, precio, id_usuario, materia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      titulo,
      descripcion || null,
      contenido || null,
      archivo_url || null,
      tipo || 'gratis',
      tipo === 'pago' ? precio : 0,
      req.user.id,
      materia || null
    );

    const apunte = db.prepare('SELECT * FROM apuntes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ mensaje: 'Apunte publicado exitosamente', apunte });
  } catch (err) {
    next(err);
  }
}

function listar(req, res, next) {
  try {
    const { tipo, materia, usuario } = req.query;
    const db = getDb();

    let query = `
      SELECT ap.*, u.nombre AS nombre_autor, u.email AS email_autor,
        COALESCE(AVG(c.puntuacion), 0) AS promedio_calificacion,
        COUNT(c.id) AS total_calificaciones
      FROM apuntes ap
      JOIN usuarios u ON ap.id_usuario = u.id
      LEFT JOIN calificaciones c ON ap.id = c.id_apunte
    `;
    const conditions = [];
    const params = [];

    if (tipo) { conditions.push('ap.tipo = ?'); params.push(tipo); }
    if (materia) { conditions.push('ap.materia LIKE ?'); params.push(`%${materia}%`); }
    if (usuario) { conditions.push('ap.id_usuario = ?'); params.push(usuario); }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' GROUP BY ap.id ORDER BY ap.fecha_creacion DESC';

    const apuntes = db.prepare(query).all(...params);
    res.json({ apuntes });
  } catch (err) {
    next(err);
  }
}

function obtener(req, res, next) {
  try {
    const db = getDb();
    const apunte = db.prepare(`
      SELECT ap.*, u.nombre AS nombre_autor, u.email AS email_autor,
        COALESCE(AVG(c.puntuacion), 0) AS promedio_calificacion,
        COUNT(c.id) AS total_calificaciones
      FROM apuntes ap
      JOIN usuarios u ON ap.id_usuario = u.id
      LEFT JOIN calificaciones c ON ap.id = c.id_apunte
      WHERE ap.id = ?
      GROUP BY ap.id
    `).get(req.params.id);

    if (!apunte) return res.status(404).json({ error: 'Apunte no encontrado' });
    res.json({ apunte });
  } catch (err) {
    next(err);
  }
}

function actualizar(req, res, next) {
  try {
    const db = getDb();
    const apunte = db.prepare('SELECT * FROM apuntes WHERE id = ?').get(req.params.id);

    if (!apunte) return res.status(404).json({ error: 'Apunte no encontrado' });
    if (apunte.id_usuario !== req.user.id) {
      return res.status(403).json({ error: 'Solo el creador puede actualizar este apunte' });
    }

    const { titulo, descripcion, contenido, archivo_url, tipo, precio, materia } = req.body;

    db.prepare(`
      UPDATE apuntes SET
        titulo = COALESCE(?, titulo),
        descripcion = COALESCE(?, descripcion),
        contenido = COALESCE(?, contenido),
        archivo_url = COALESCE(?, archivo_url),
        tipo = COALESCE(?, tipo),
        precio = COALESCE(?, precio),
        materia = COALESCE(?, materia)
      WHERE id = ?
    `).run(
      titulo || null, descripcion || null, contenido || null,
      archivo_url || null, tipo || null, precio || null,
      materia || null, req.params.id
    );

    const updated = db.prepare('SELECT * FROM apuntes WHERE id = ?').get(req.params.id);
    res.json({ mensaje: 'Apunte actualizado', apunte: updated });
  } catch (err) {
    next(err);
  }
}

function eliminar(req, res, next) {
  try {
    const db = getDb();
    const apunte = db.prepare('SELECT * FROM apuntes WHERE id = ?').get(req.params.id);

    if (!apunte) return res.status(404).json({ error: 'Apunte no encontrado' });
    if (apunte.id_usuario !== req.user.id) {
      return res.status(403).json({ error: 'Solo el creador puede eliminar este apunte' });
    }

    db.prepare('DELETE FROM apuntes WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Apunte eliminado exitosamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, obtener, actualizar, eliminar };
