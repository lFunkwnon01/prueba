const express = require('express');
const router = express.Router();
const { crear, listar, obtener, actualizar, eliminar } = require('../controllers/anunciosController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// GET /api/anuncios - Listar todos (público)
router.get('/', listar);

// GET /api/anuncios/:id - Obtener uno (público)
router.get('/:id', obtener);

// POST /api/anuncios - Crear (solo docentes)
router.post('/', authenticateToken, authorizeRoles('docente'), crear);

// PUT /api/anuncios/:id - Actualizar (solo creador/docente)
router.put('/:id', authenticateToken, authorizeRoles('docente'), actualizar);

// DELETE /api/anuncios/:id - Eliminar (solo creador/docente)
router.delete('/:id', authenticateToken, authorizeRoles('docente'), eliminar);

module.exports = router;
