# 🚀 Guía de Despliegue - Yassline Tour

## 📋 Resumen del Stack

- **Frontend**: Next.js (estático) → Hostinger
- **Backend**: Node.js/Express → Railway o Render
- **Base de Datos**: MongoDB Atlas

---

## 🔧 Paso 1: Desplegar Backend en Railway (Recomendado)

### 1.1 Preparación
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta con GitHub
3. Click en **"New Project"**

### 1.2 Conectar Repositorio
1. Selecciona **"Deploy from GitHub repo"**
2. Conecta tu repositorio de GitHub
3. Selecciona la carpeta `backend` del proyecto

### 1.3 Configurar Variables de Entorno
En Railway, ve a **Variables** y agrega:

```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
NODE_ENV=production
```

### 1.4 Obtener URL del Backend
1. Railway generará una URL automáticamente (ej: `https://yassline-backend.railway.app`)
2. **Copia esta URL** - la necesitarás para el frontend

---

## 🔧 Paso 2: Desplegar Backend en Render (Alternativa)

### 2.1 Preparación
1. Ve a [render.com](https://render.com)
2. Crea una cuenta con GitHub
3. Click en **"New"** → **"Web Service"**

### 2.2 Conectar Repositorio
1. Conecta tu repositorio de GitHub
2. Configura:
   - **Name**: `yassline-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Configurar Variables de Entorno
En **Environment Variables**, agrega:

```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
NODE_ENV=production
```

### 2.4 Obtener URL del Backend
1. Render generará una URL (ej: `https://yassline-backend.onrender.com`)
2. **Copia esta URL**

---

## 🎨 Paso 3: Preparar Frontend para Hostinger

### 3.1 Configurar Variable de Entorno del Backend

Crea un archivo `.env.local` en la carpeta `frontend`:

```env
NEXT_PUBLIC_API_URL=https://tu-backend-url.railway.app
```

Reemplaza `https://tu-backend-url.railway.app` con la URL real de tu backend.

### 3.2 Build del Frontend

```bash
cd frontend
npm install
npm run build
```

Esto generará una carpeta `.next` con los archivos estáticos.

### 3.3 Exportar como Sitio Estático

Edita `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  reactCompiler: true,
};

export default nextConfig;
```

Luego ejecuta:
```bash
npm run build
```

Esto creará una carpeta `out` con todos los archivos estáticos.

---

## 📤 Paso 4: Subir Frontend a Hostinger

### 4.1 Conectar por FTP

Usa un cliente FTP (FileZilla, WinSCP, etc.) con estos datos:

- **Host**: `ftp://yassline.com` o `82.180.134.97`
- **Usuario**: `u625102141.yassline.com`
- **Contraseña**: (la de tu cuenta Hostinger)
- **Puerto**: `21`

### 4.2 Subir Archivos

1. Conéctate al servidor FTP
2. Navega a la carpeta `public_html`
3. **Elimina** todos los archivos existentes (si los hay)
4. Sube **todo el contenido** de la carpeta `frontend/out` a `public_html`
   - NO subas la carpeta `out`, solo su contenido

### 4.3 Estructura Final en Hostinger

```
public_html/
  ├── index.html
  ├── _next/
  ├── img/
  └── ... (otros archivos)
```

---

## ✅ Paso 5: Verificar Despliegue

### 5.1 Verificar Frontend
- Visita: `https://yassline.com`
- Deberías ver tu landing page funcionando

### 5.2 Verificar Backend
- Visita: `https://tu-backend-url.railway.app`
- Deberías ver: `{"message": "¡El motor de Yassline Tour está en marcha!"}`

### 5.3 Verificar Conexión
- Abre la consola del navegador en `yassline.com`
- Verifica que no haya errores de CORS o conexión al backend

---

## 🔄 Actualizar CORS en Backend

Si tu dominio cambia, actualiza `backend/server.js` en la sección `allowedOrigins`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://yassline.com',
  'https://www.yassline.com'
];
```

Luego vuelve a desplegar el backend.

---

## 🐛 Solución de Problemas

### Frontend no carga
- Verifica que subiste los archivos a `public_html`
- Verifica que `index.html` está en la raíz de `public_html`

### Backend no responde
- Verifica las variables de entorno en Railway/Render
- Verifica los logs en Railway/Render
- Verifica que MongoDB Atlas tiene tu IP en la whitelist

### Errores de CORS
- Verifica que el dominio está en `allowedOrigins` del backend
- Verifica que `NEXT_PUBLIC_API_URL` está configurado correctamente

---

## 📞 Soporte

Si tienes problemas, verifica:
1. Logs del backend en Railway/Render
2. Consola del navegador (F12)
3. Variables de entorno configuradas correctamente
