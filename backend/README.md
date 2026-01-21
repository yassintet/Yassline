# Yassline Tour - Backend API

Backend API para Yassline Tour construido con Node.js, Express y MongoDB.

## 🚀 Despliegue Rápido

### Opción 1: Railway (Recomendado)

1. Ve a [Railway.app](https://railway.app)
2. Crea una cuenta o inicia sesión
3. Click en "New Project" → "Deploy from GitHub repo"
4. Conecta tu repositorio y selecciona la carpeta `backend`
5. Agrega las variables de entorno:
   - `MONGO_URI`: Tu cadena de conexión de MongoDB Atlas
   - `PORT`: Se configura automáticamente (no es necesario)
   - `NODE_ENV`: `production`
6. Railway desplegará automáticamente

### Opción 2: Render

1. Ve a [Render.com](https://render.com)
2. Crea una cuenta o inicia sesión
3. Click en "New" → "Web Service"
4. Conecta tu repositorio y selecciona la carpeta `backend`
5. Configuración:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Agrega las variables de entorno:
   - `MONGO_URI`: Tu cadena de conexión de MongoDB Atlas
   - `NODE_ENV`: `production`
7. Click en "Create Web Service"

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del backend:

```env
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
NODE_ENV=development
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 📡 Endpoints

- `GET /` - Health check del servidor

## 🔒 CORS

El servidor está configurado para aceptar requests desde:
- `http://localhost:3000` (desarrollo)
- `https://yassline.com` (producción)
- `https://www.yassline.com` (producción)
