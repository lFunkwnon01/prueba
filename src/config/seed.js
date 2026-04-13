require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initializeDb, getDb } = require('./database');

function seed() {
  initializeDb();
  const db = getDb();

  // Limpiar tablas
  db.exec('DELETE FROM calificaciones');
  db.exec('DELETE FROM apuntes');
  db.exec('DELETE FROM anuncios');
  db.exec('DELETE FROM usuarios');

  const hashPassword = (pw) => bcrypt.hashSync(pw, 10);

  // Insertar usuarios
  const insertUser = db.prepare(
    'INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)'
  );

  insertUser.run('profesor@universidad.edu', hashPassword('password123'), 'Dr. Carlos Méndez', 'docente');
  insertUser.run('profesora@universidad.edu', hashPassword('password123'), 'Dra. Ana García', 'docente');
  insertUser.run('juan@estudiante.edu', hashPassword('password123'), 'Juan Pérez', 'estudiante');
  insertUser.run('maria@estudiante.edu', hashPassword('password123'), 'María López', 'estudiante');
  insertUser.run('pedro@estudiante.edu', hashPassword('password123'), 'Pedro Ramírez', 'estudiante');

  // Insertar anuncios (id_docente = 1 y 2)
  const insertAnuncio = db.prepare(
    'INSERT INTO anuncios (titulo, descripcion, id_docente) VALUES (?, ?, ?)'
  );

  insertAnuncio.run('Examen parcial - Matemáticas', 'El examen parcial será el viernes 25 de abril. Temas: Cálculo diferencial e integral.', 1);
  insertAnuncio.run('Cambio de horario - Programación', 'La clase del miércoles se mueve al jueves de 10 a 12.', 1);
  insertAnuncio.run('Entrega de proyecto final', 'Fecha límite para entregar el proyecto final: 30 de abril.', 2);

  // Insertar apuntes
  const insertApunte = db.prepare(
    'INSERT INTO apuntes (titulo, descripcion, contenido, tipo, precio, id_usuario, materia) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  insertApunte.run('Resumen Cálculo I', 'Resumen completo de derivadas e integrales', 'Contenido del resumen de cálculo...', 'gratis', 0, 3, 'Matemáticas');
  insertApunte.run('Guía de Algoritmos', 'Guía práctica de algoritmos de ordenamiento', 'Bubble sort, Quick sort, Merge sort...', 'gratis', 0, 4, 'Programación');
  insertApunte.run('Apuntes Completos Física II', 'Apuntes detallados de electromagnetismo', 'Capítulo 1: Ley de Coulomb...', 'pago', 15.50, 3, 'Física');
  insertApunte.run('Notas de Bases de Datos', 'SQL, normalización y diseño relacional', 'SELECT, INSERT, UPDATE, DELETE...', 'pago', 10.00, 5, 'Bases de Datos');

  // Insertar calificaciones
  const insertCalif = db.prepare(
    'INSERT INTO calificaciones (id_apunte, id_usuario, puntuacion, comentario) VALUES (?, ?, ?, ?)'
  );

  insertCalif.run(1, 4, 5, 'Excelente resumen, muy completo');
  insertCalif.run(1, 5, 4, 'Muy bueno, faltan algunos ejemplos');
  insertCalif.run(2, 3, 5, 'La mejor guía de algoritmos que he visto');
  insertCalif.run(3, 4, 3, 'Bien pero podría tener más diagramas');

  console.log('Datos de ejemplo insertados correctamente');
  console.log('Usuarios de prueba:');
  console.log('  Docente: profesor@universidad.edu / password123');
  console.log('  Docente: profesora@universidad.edu / password123');
  console.log('  Estudiante: juan@estudiante.edu / password123');
  console.log('  Estudiante: maria@estudiante.edu / password123');
  console.log('  Estudiante: pedro@estudiante.edu / password123');
}

seed();
