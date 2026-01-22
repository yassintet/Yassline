FROM node:18-alpine

# Crear carpeta de trabajo
WORKDIR /app

# Copiar package.json raíz y package.json del backend para poder instalar dependencias por separado
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Instalar dependencias (root si existieran), luego las del backend
RUN npm install --production || true && \
    cd backend && npm install --production

# Copiar el resto del código
COPY . .

# Puerto por defecto
ENV PORT=${PORT:-4000}

EXPOSE 4000

# Comando de arranque (usa tu script start en package.json)
CMD ["npm", "start"]
