FROM node:18-alpine

# Crear carpeta de trabajo
WORKDIR /app

# Copiar package.json del backend primero para aprovechar cache de Docker
COPY backend/package.json backend/package-lock.json* ./backend/

# Instalar dependencias del backend
RUN cd backend && npm install --production

# Copiar el resto del código del backend
COPY backend/ ./backend/

# Puerto por defecto (Railway lo sobrescribirá)
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

# Comando de arranque
WORKDIR /app/backend
CMD ["node", "server.js"]
