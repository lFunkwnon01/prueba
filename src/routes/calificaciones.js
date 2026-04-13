const express = require('express');
const router = express.Router();
const { calificar } = require('../controllers/calificacionesController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/calificaciones - Calificar un apunte (autenticado)
router.post('/', authenticateToken, calificar);

module.exports = router;
