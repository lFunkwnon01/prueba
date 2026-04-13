const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './data/apuntes_educativos.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('estudiante', 'docente')),
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS anuncios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      id_docente INTEGER NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_docente) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS apuntes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      contenido TEXT,
      archivo_url TEXT,
      tipo TEXT NOT NULL CHECK(tipo IN ('gratis', 'pago')) DEFAULT 'gratis',
      precio REAL DEFAULT 0,
      id_usuario INTEGER NOT NULL,
      materia TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS calificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_apunte INTEGER NOT NULL,
      id_usuario INTEGER NOT NULL,
      puntuacion INTEGER NOT NULL CHECK(puntuacion >= 1 AND puntuacion <= 5),
      comentario TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_apunte) REFERENCES apuntes(id) ON DELETE CASCADE,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
      UNIQUE(id_apunte, id_usuario)
    );
  `);

  console.log('Base de datos inicializada correctamente');
  return db;
}

module.exports = { getDb, initializeDb };
