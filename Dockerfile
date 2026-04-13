FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema para better-sqlite3
RUN apk add --no-cache python3 make g++

# Copiar package.json y instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/index.js"]
