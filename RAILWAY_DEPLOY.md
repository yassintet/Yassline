# 🚂 Guía de Despliegue en Railway

## Prerrequisitos

1. ✅ Cuenta en Railway: https://railway.app
2. ✅ Proyecto en GitHub: https://github.com/yassintet/Yassline
3. ✅ MongoDB Atlas configurado y funcionando

## Pasos para Desplegar

### 1. Conectar Railway con GitHub

1. Ve a https://railway.app y inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu cuenta de GitHub
5. Selecciona el repositorio: `yassintet/Yassline`
6. Railway detectará automáticamente el proyecto Node.js

### 2. Configurar Variables de Entorno

En Railway, ve a tu proyecto → **Variables** y agrega:

```
PORT=4000
MONGO_URI=mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
JWT_SECRET=yassline-tour-secret-key-change-in-production-railway
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Reemplaza `STCYcH8pvIwy3Sbo` con tu contraseña real de MongoDB
- Cambia `JWT_SECRET` por una clave secreta segura y única
- Railway detectará automáticamente el `PORT`, pero puedes dejarlo en 4000

### 3. Configurar el Build

Railway debería detectar automáticamente:
- **Root Directory**: `/` (raíz del proyecto)
- **Build Command**: `cd backend && npm install --production`
- **Start Command**: `cd backend && node server.js`

Si Railway no detecta correctamente, puedes configurarlo manualmente:

1. Ve a **Settings** → **Deploy**
2. **Root Directory**: Deja vacío (raíz)
3. **Build Command**: `cd backend && npm install --production`
4. **Start Command**: `cd backend && node server.js`

### 4. Verificar el Despliegue

1. Railway iniciará el build automáticamente
2. Revisa los **Logs** para ver el progreso
3. Deberías ver mensajes como:
   - `📦 Cargando rutas...`
   - `✅ Rutas registradas en Express`
   - `✅ MongoDB Conectado exitosamente`
   - `🚀 Servidor corriendo en http://0.0.0.0:4000`

### 5. Obtener la URL de Producción

1. Ve a **Settings** → **Networking**
2. Haz clic en **"Generate Domain"** para obtener una URL pública
3. O configura un dominio personalizado si lo tienes

### 6. Probar la API en Producción

```bash
# Ruta principal
curl https://tu-proyecto.railway.app/

# Obtener circuitos
curl https://tu-proyecto.railway.app/api/circuits

# Obtener vehículos
curl https://tu-proyecto.railway.app/api/vehicles
```

## Solución de Problemas

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `backend/package.json`
- Asegúrate de que el build command ejecute `npm install` en el directorio `backend`

### Error: "MongoDB connection failed"
- Verifica que `MONGO_URI` esté correctamente configurada en Variables
- Asegúrate de que la IP de Railway esté en la whitelist de MongoDB Atlas
  - En MongoDB Atlas → Network Access → Add IP Address → `0.0.0.0/0` (permite todas)

### Error: "Port already in use"
- Railway asigna automáticamente el puerto via `PORT` env var
- Asegúrate de que `server.js` use `process.env.PORT || 4000`

### El servidor no inicia
- Revisa los logs en Railway
- Verifica que el `startCommand` sea correcto
- Asegúrate de que `backend/server.js` exista

## Comandos Útiles

### Ver logs en tiempo real
Railway muestra los logs automáticamente en el dashboard.

### Reiniciar el servicio
En Railway → Deployments → Haz clic en el menú (⋯) → **Restart**

### Ver variables de entorno
Railway → Variables → Ver todas las variables configuradas

## Próximos Pasos

1. ✅ Configurar dominio personalizado (opcional)
2. ✅ Configurar SSL/HTTPS (automático en Railway)
3. ✅ Configurar monitoreo y alertas
4. ✅ Configurar backups de MongoDB Atlas

## Recursos

- [Documentación de Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
