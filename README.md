# API de Apuntes Educativos

API REST construida con **Node.js**, **Express** y **SQLite3** para gestionar apuntes educativos, anuncios de grupos y calificaciones.

## Características

- 🔐 Autenticación con JWT (registro/login)
- 👥 Roles: estudiante y docente
- 📢 CRUD de anuncios (solo docentes)
- 📝 CRUD de apuntes (gratis y de pago)
- ⭐ Sistema de calificaciones (1-5 estrellas)
- 🗄️ Base de datos SQLite3
- 🐳 Docker ready

## Estructura del Proyecto

```
api-apuntes-educativos/
├── src/
│   ├── config/
│   │   ├── database.js      # Conexión y esquema SQLite
│   │   └── seed.js           # Datos de ejemplo
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── anunciosController.js
│   │   ├── apuntesController.js
│   │   └── calificacionesController.js
│   ├── middlewares/
│   │   ├── auth.js           # JWT y roles
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── anuncios.js
│   │   ├── apuntes.js
│   │   └── calificaciones.js
│   └── index.js              # Entry point
├── data/                      # Base de datos SQLite
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── postman_collection.json
└── package.json
```

## Instalación y Ejecución

### Sin Docker

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd api-apuntes-educativos

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# 4. Cargar datos de ejemplo (opcional)
npm run seed

# 5. Iniciar el servidor
npm start

# Para desarrollo con auto-reload:
npm run dev
```

### Con Docker

```bash
# Construir y ejecutar
docker-compose up --build

# En segundo plano
docker-compose up --build -d

# Detener
docker-compose down

# Para cargar datos de ejemplo dentro del contenedor:
docker-compose exec api node src/config/seed.js
```

El servidor estará disponible en `http://localhost:3000`

## Usuarios de Prueba (después de ejecutar seed)

| Email | Password | Rol |
|-------|----------|-----|
| profesor@universidad.edu | password123 | docente |
| profesora@universidad.edu | password123 | docente |
| juan@estudiante.edu | password123 | estudiante |
| maria@estudiante.edu | password123 | estudiante |
| pedro@estudiante.edu | password123 | estudiante |

## Endpoints

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/profile` | Ver perfil | Sí |

#### POST /api/auth/register
```json
{
  "email": "nuevo@correo.com",
  "password": "miPassword123",
  "nombre": "Nombre Completo",
  "rol": "estudiante"
}
```

#### POST /api/auth/login
```json
{
  "email": "profesor@universidad.edu",
  "password": "password123"
}
```
**Respuesta:** Retorna un `token` JWT que debe enviarse en el header `Authorization: Bearer <token>`

### Anuncios

| Método | Ruta | Descripción | Auth | Rol |
|--------|------|-------------|------|-----|
| GET | `/api/anuncios` | Listar anuncios | No | - |
| GET | `/api/anuncios/:id` | Obtener anuncio | No | - |
| POST | `/api/anuncios` | Crear anuncio | Sí | docente |
| PUT | `/api/anuncios/:id` | Actualizar anuncio | Sí | docente (creador) |
| DELETE | `/api/anuncios/:id` | Eliminar anuncio | Sí | docente (creador) |

#### POST /api/anuncios
```json
{
  "titulo": "Título del anuncio",
  "descripcion": "Descripción detallada del anuncio"
}
```

### Apuntes

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/apuntes` | Listar apuntes | No |
| GET | `/api/apuntes?tipo=gratis` | Filtrar por tipo | No |
| GET | `/api/apuntes?materia=Matemáticas` | Filtrar por materia | No |
| GET | `/api/apuntes/:id` | Obtener apunte | No |
| POST | `/api/apuntes` | Publicar apunte | Sí |
| PUT | `/api/apuntes/:id` | Actualizar apunte | Sí (creador) |
| DELETE | `/api/apuntes/:id` | Eliminar apunte | Sí (creador) |

#### POST /api/apuntes
```json
{
  "titulo": "Resumen de Álgebra",
  "descripcion": "Resumen del primer parcial",
  "contenido": "Contenido completo aquí...",
  "tipo": "gratis",
  "precio": 0,
  "materia": "Matemáticas"
}
```

### Calificaciones

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/calificaciones` | Calificar apunte | Sí |
| GET | `/api/apuntes/:id/calificaciones` | Ver calificaciones | No |

#### POST /api/calificaciones
```json
{
  "id_apunte": 1,
  "puntuacion": 5,
  "comentario": "Excelente material"
}
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| PORT | Puerto del servidor | 3000 |
| JWT_SECRET | Secreto para firmar tokens | - |
| JWT_EXPIRES_IN | Expiración del token | 24h |
| DB_PATH | Ruta de la BD SQLite | ./data/apuntes_educativos.db |

## Pruebas con Postman

1. Importar el archivo `postman_collection.json` en Postman
2. Ejecutar "Login Docente" para obtener un token
3. El token se guarda automáticamente en la variable `{{token}}`
4. Los demás endpoints usan esa variable en el header Authorization

## Pruebas con cURL

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","nombre":"Test User","rol":"estudiante"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"profesor@universidad.edu","password":"password123"}'

# Listar anuncios
curl http://localhost:3000/api/anuncios

# Crear anuncio (reemplazar TOKEN)
curl -X POST http://localhost:3000/api/anuncios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"titulo":"Nuevo anuncio","descripcion":"Descripción del anuncio"}'

# Listar apuntes filtrados
curl "http://localhost:3000/api/apuntes?tipo=gratis&materia=Matemáticas"

# Calificar apunte
curl -X POST http://localhost:3000/api/calificaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"id_apunte":1,"puntuacion":5,"comentario":"Muy bueno"}'
```

## Tecnologías

- **Node.js** + **Express.js**
- **SQLite3** (better-sqlite3)
- **JWT** (jsonwebtoken)
- **bcryptjs** para hash de passwords
- **Docker** + **Docker Compose**
