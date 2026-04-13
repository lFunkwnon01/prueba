const express = require('express');
const router = express.Router();
const { crear, listar, obtener, actualizar, eliminar } = require('../controllers/apuntesController');
const { calificar, listarPorApunte } = require('../controllers/calificacionesController');
const { authenticateToken } = require('../middlewares/auth');

// GET /api/apuntes - Listar (público, con filtros)
router.get('/', listar);

// GET /api/apuntes/:id - Obtener uno (público)
router.get('/:id', obtener);

// POST /api/apuntes - Crear (autenticado)
router.post('/', authenticateToken, crear);

// PUT /api/apuntes/:id - Actualizar (solo creador)
router.put('/:id', authenticateToken, actualizar);

// DELETE /api/apuntes/:id - Eliminar (solo creador)
router.delete('/:id', authenticateToken, eliminar);

// GET /api/apuntes/:id/calificaciones - Ver calificaciones del apunte
router.get('/:id/calificaciones', listarPorApunte);

module.exports = router;
