const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');

function register(req, res, next) {
  try {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: email, password, nombre, rol' });
    }

    if (!['estudiante', 'docente'].includes(rol)) {
      return res.status(400).json({ error: 'El rol debe ser "estudiante" o "docente"' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const db = getDb();

    // Verificar si ya existe
    const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(
      'INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)'
    ).run(email, hashedPassword, nombre, rol);

    const user = db.prepare('SELECT id, email, nombre, rol, fecha_creacion FROM usuarios WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: user
    });
  } catch (err) {
    next(err);
  }
}

function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (err) {
    next(err);
  }
}

function getProfile(req, res, next) {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, email, nombre, rol, fecha_creacion FROM usuarios WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ usuario: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile };
