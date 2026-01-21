# 🚂 Guía Detallada: Railway + GitHub

## 📝 Paso a Paso: Conectar Railway con GitHub

### Paso 1: Crear Cuenta en Railway

1. **Ve a Railway**: https://railway.app
2. **Click en "Login"** (arriba a la derecha)
3. **Selecciona "Login with GitHub"**
4. **Autoriza Railway** para acceder a tu cuenta de GitHub

---

### Paso 2: Subir Código a GitHub (Si aún no lo has hecho)

Si tu código **NO está en GitHub**, necesitas subirlo primero:

#### 2.1 Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en el **"+"** (arriba derecha) → **"New repository"**
3. Nombre: `yasslinetour` (o el que prefieras)
4. Selecciona **"Private"** o **"Public"**
5. **NO marques** "Add README", "Add .gitignore" ni "Choose a license"
6. Click en **"Create repository"**

#### 2.2 Subir Código desde tu Computadora

Abre PowerShell o Terminal en la carpeta de tu proyecto:

```bash
# Inicializar Git (si no lo has hecho)
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME"
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/yasslinetour.git

# Subir código
git branch -M main
git push -u origin main
```

**Nota**: Si te pide autenticación, usa un Personal Access Token de GitHub.

---

### Paso 3: Conectar Railway con GitHub

#### 3.1 Crear Nuevo Proyecto

1. En Railway, click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**

#### 3.2 Autorizar GitHub (si es necesario)

- Si es la primera vez, Railway te pedirá autorizar acceso
- Click en **"Authorize Railway"**
- Selecciona tu cuenta de GitHub

#### 3.3 Seleccionar Repositorio

1. Busca y selecciona tu repositorio (`yasslinetour` o el nombre que usaste)
2. Railway detectará automáticamente que es un proyecto Node.js

#### 3.4 Configurar Carpeta Backend

1. Railway debería detectar automáticamente
2. Si no, en **Settings** → **Root Directory**, escribe: `backend`
3. O si te pregunta al inicio, selecciona **"Select folder"** → `backend`

---

### Paso 4: Configurar Variables de Entorno

1. En Railway, dentro de tu proyecto, ve a la pestaña **"Variables"**
2. Click en **"+ New Variable"**
3. Agrega estas variables:

   **Variable 1:**
   - **Key**: `MONGO_URI`
   - **Value**: `mongodb+srv://usuario:password@yassline.v3oycnj.mongodb.net/database`
   - (Pega tu cadena de conexión completa de MongoDB Atlas)

   **Variable 2:**
   - **Key**: `NODE_ENV`
   - **Value**: `production`

4. Click en **"Add"** para cada variable

---

### Paso 5: Configurar el Servicio

1. Railway debería detectar automáticamente `server.js`
2. Verifica que en **Settings** → **Start Command** esté: `npm start`
3. Verifica que en **Settings** → **Root Directory** esté: `backend`

---

### Paso 6: Desplegar

1. Railway comenzará a desplegar automáticamente
2. Espera a que termine (verás logs en tiempo real)
3. Cuando termine, verás **"✅ Deploy successful"**

---

### Paso 7: Obtener URL del Backend

1. En Railway, ve a la pestaña **"Settings"**
2. Baja hasta **"Networking"**
3. Click en **"Generate Domain"**
4. Railway generará una URL como: `https://yassline-production.up.railway.app`
5. **Copia esta URL** - la necesitarás para el frontend

---

## 🆘 Solución de Problemas Comunes

### Error: "No se encuentra el repositorio"
- **Solución**: Asegúrate de que el repositorio sea público, o que hayas dado permisos a Railway

### Error: "No se detecta Node.js"
- **Solución**: Verifica que `package.json` esté en la carpeta `backend`

### Error: "Module not found"
- **Solución**: Railway debería ejecutar `npm install` automáticamente, pero verifica que todas las dependencias estén en `package.json`

### Error: "Port already in use"
- **Solución**: Railway asigna el puerto automáticamente, usa `process.env.PORT` (ya está configurado)

### Error: "Cannot connect to MongoDB"
- **Solución**: 
  1. Verifica que `MONGO_URI` esté bien configurado
  2. En MongoDB Atlas, agrega `0.0.0.0/0` a la Network Access List (temporalmente para probar)

---

## 📸 Capturas de Pantalla (Pasos Clave)

1. **New Project** → "Deploy from GitHub repo"
2. **Select Repository** → Tu repositorio
3. **Variables** → Agregar `MONGO_URI` y `NODE_ENV`
4. **Settings** → "Generate Domain" para obtener URL

---

## 🔄 Alternativa: Render (Más Fácil)

Si Railway te da muchos problemas, Render es más simple:

1. Ve a https://render.com
2. "Sign Up" con GitHub
3. "New" → "Web Service"
4. Conecta tu repositorio
5. Configura:
   - **Name**: `yassline-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Agrega variables de entorno
7. Click "Create Web Service"

¡Listo! Render es más directo y tiene mejor interfaz para principiantes.

---

¿Necesitas ayuda con algún paso específico? Indica en qué paso te quedaste atascado.
