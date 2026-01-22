# 🚀 Inicio Rápido - Railway Deployment

## Pasos Rápidos (5 minutos)

### 1. Subir cambios a GitHub (si hay cambios pendientes)

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME"
git add .
git commit -m "Preparar para despliegue en Railway"
git push origin main
```

### 2. Conectar Railway con GitHub

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Elige el repositorio: `yassintet/Yassline`
6. Railway detectará automáticamente el proyecto

### 3. Configurar Variables de Entorno

En Railway → Tu Proyecto → **Variables** → **New Variable**

Agrega estas variables:

| Variable | Valor |
|---------|-------|
| `PORT` | `4000` |
| `MONGO_URI` | `mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline` |
| `JWT_SECRET` | `yassline-tour-secret-key-production-railway-2024` |
| `NODE_ENV` | `production` |

**⚠️ IMPORTANTE:** 
- Reemplaza la contraseña de MongoDB si es diferente
- Cambia `JWT_SECRET` por una clave única y segura

### 4. Configurar Build Settings

Railway debería detectar automáticamente, pero verifica:

**Settings → Deploy:**
- **Root Directory**: (vacío - raíz del proyecto)
- **Build Command**: `cd backend && npm install --production`
- **Start Command**: `cd backend && node server.js`

### 5. Verificar Despliegue

1. Railway iniciará el build automáticamente
2. Ve a **Deployments** para ver el progreso
3. Revisa los **Logs** - deberías ver:
   ```
   📦 Cargando rutas...
   ✅ Rutas registradas en Express
   ✅ MongoDB Conectado exitosamente
   🚀 Servidor corriendo en http://0.0.0.0:4000
   ```

### 6. Obtener URL Pública

1. Ve a **Settings → Networking**
2. Click en **"Generate Domain"**
3. Obtendrás una URL como: `https://tu-proyecto.up.railway.app`

### 7. Probar la API

```powershell
# Probar ruta principal
Invoke-RestMethod -Uri "https://tu-proyecto.up.railway.app/"

# Probar circuitos
Invoke-RestMethod -Uri "https://tu-proyecto.up.railway.app/api/circuits"

# Probar vehículos
Invoke-RestMethod -Uri "https://tu-proyecto.up.railway.app/api/vehicles"
```

## ✅ Checklist Pre-Despliegue

- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas en Railway
- [ ] MongoDB Atlas whitelist incluye `0.0.0.0/0` (permite todas las IPs)
- [ ] Build Command configurado correctamente
- [ ] Start Command configurado correctamente

## 🔧 Solución de Problemas Comunes

### Build falla
- Verifica que `backend/package.json` tenga todas las dependencias
- Revisa los logs de build en Railway

### MongoDB no conecta
- Verifica `MONGO_URI` en Variables
- Asegúrate de que MongoDB Atlas permita conexiones desde cualquier IP (`0.0.0.0/0`)

### Puerto no asignado
- Railway asigna el puerto automáticamente via `PORT`
- El servidor debe usar `process.env.PORT || 4000`

## 📞 ¿Necesitas Ayuda?

Si encuentras problemas:
1. Revisa los logs en Railway
2. Verifica las variables de entorno
3. Consulta `RAILWAY_DEPLOY.md` para más detalles
