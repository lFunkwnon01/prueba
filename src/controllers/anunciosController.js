const { getDb } = require('../config/database');

function crear(req, res, next) {
  try {
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: 'Título y descripción son obligatorios' });
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO anuncios (titulo, descripcion, id_docente) VALUES (?, ?, ?)'
    ).run(titulo, descripcion, req.user.id);

    const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ mensaje: 'Anuncio creado exitosamente', anuncio });
  } catch (err) {
    next(err);
  }
}

function listar(req, res, next) {
  try {
    const db = getDb();
    const anuncios = db.prepare(`
      SELECT a.*, u.nombre AS nombre_docente, u.email AS email_docente
      FROM anuncios a
      JOIN usuarios u ON a.id_docente = u.id
      ORDER BY a.fecha_creacion DESC
    `).all();

    res.json({ anuncios });
  } catch (err) {
    next(err);
  }
}

function obtener(req, res, next) {
  try {
    const db = getDb();
    const anuncio = db.prepare(`
      SELECT a.*, u.nombre AS nombre_docente, u.email AS email_docente
      FROM anuncios a
      JOIN usuarios u ON a.id_docente = u.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!anuncio) return res.status(404).json({ error: 'Anuncio no encontrado' });
    res.json({ anuncio });
  } catch (err) {
    next(err);
  }
}

function actualizar(req, res, next) {
  try {
    const db = getDb();
    const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(req.params.id);

    if (!anuncio) return res.status(404).json({ error: 'Anuncio no encontrado' });
    if (anuncio.id_docente !== req.user.id) {
      return res.status(403).json({ error: 'Solo el creador puede actualizar este anuncio' });
    }

    const { titulo, descripcion } = req.body;
    db.prepare(
      'UPDATE anuncios SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion) WHERE id = ?'
    ).run(titulo || null, descripcion || null, req.params.id);

    const updated = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(req.params.id);
    res.json({ mensaje: 'Anuncio actualizado', anuncio: updated });
  } catch (err) {
    next(err);
  }
}

function eliminar(req, res, next) {
  try {
    const db = getDb();
    const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(req.params.id);

    if (!anuncio) return res.status(404).json({ error: 'Anuncio no encontrado' });
    if (anuncio.id_docente !== req.user.id) {
      return res.status(403).json({ error: 'Solo el creador puede eliminar este anuncio' });
    }

    db.prepare('DELETE FROM anuncios WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Anuncio eliminado exitosamente' });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, obtener, actualizar, eliminar };
