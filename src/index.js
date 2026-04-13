require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDb } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Rutas
const authRoutes = require('./routes/auth');
const anunciosRoutes = require('./routes/anuncios');
const apuntesRoutes = require('./routes/apuntes');
const calificacionesRoutes = require('./routes/calificaciones');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Apuntes Educativos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      anuncios: '/api/anuncios',
      apuntes: '/api/apuntes',
      calificaciones: '/api/calificaciones'
    }
  });
});

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/apuntes', apuntesRoutes);
app.use('/api/calificaciones', calificacionesRoutes);

// Manejo de errores
app.use(errorHandler);

// Inicializar BD y arrancar servidor
initializeDb();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/auth/profile`);
  console.log(`  CRUD   /api/anuncios`);
  console.log(`  CRUD   /api/apuntes`);
  console.log(`  POST   /api/calificaciones`);
  console.log(`  GET    /api/apuntes/:id/calificaciones`);
});

module.exports = app;
