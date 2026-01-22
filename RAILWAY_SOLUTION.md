# ✅ Solución: "Could not find root directory: backend"

## Problema
Railway no encuentra la carpeta `backend` en tu repositorio.

## 🔍 Diagnóstico

Primero, verifica que la carpeta `backend` esté en GitHub:

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/yasslinetour`
2. Verifica que veas la carpeta `backend/` con archivos como:
   - `package.json`
   - `server.js`
   - etc.

**Si NO ves la carpeta `backend`:** El código no se subió correctamente.

---

## ✅ Solución 1: Verificar que el código esté en GitHub

### Opción A: Si NO está en GitHub

1. Abre PowerShell en tu proyecto:
   ```powershell
   cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME"
   ```

2. Verifica qué archivos Git está rastreando:
   ```powershell
   git status
   ```

3. Si `backend/` no aparece, agrégalo:
   ```powershell
   git add backend/
   git commit -m "Add backend folder"
   git push
   ```

### Opción B: Si SÍ está en GitHub

Continúa con la Solución 2.

---

## ✅ Solución 2: Cambiar Root Directory en Railway

1. En Railway, ve a tu proyecto
2. Click en el servicio que está fallando
3. Ve a **Settings** → **Root Directory**
4. **Borra** lo que está escrito
5. **Déjalo vacío** (esto hará que Railway use la raíz del repositorio)
6. Click **Save**
7. Railway se reiniciará

### Luego, configura los comandos manualmente:

En **Settings** → **Build Command**:
```bash
cd backend && npm install
```

En **Settings** → **Start Command**:
```bash
cd backend && npm start
```

---

## ✅ Solución 3: Crear repositorio separado para backend (Más Simple)

Esta es la opción más fácil y recomendada:

### Paso 1: Crear nuevo repositorio solo para backend

1. Ve a GitHub → **New repository**
2. Nombre: `yassline-backend`
3. **NO marques** "Add README"
4. Click **Create repository**

### Paso 2: Subir solo la carpeta backend

Abre PowerShell:

```powershell
# Crear carpeta temporal
cd "C:\Users\pc\Desktop"
mkdir yassline-backend-temp
cd yassline-backend-temp

# Copiar contenido de backend
Copy-Item -Path "DESARROLLO WEB\YASSLINEPLATFORME\backend\*" -Destination . -Recurse

# Inicializar Git
git init
git add .
git commit -m "Initial commit - Backend"

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/yassline-backend.git
git branch -M main
git push -u origin main
```

### Paso 3: Conectar Railway con el nuevo repositorio

1. En Railway, **elimina** el servicio actual (si existe)
2. **New Project** → **Deploy from GitHub repo**
3. Selecciona el repositorio `yassline-backend`
4. Railway detectará automáticamente que es Node.js
5. Agrega las variables de entorno:
   - `MONGO_URI`
   - `NODE_ENV=production`
6. ¡Listo!

---

## ✅ Solución 4: Usar Render en lugar de Railway

Render es más simple y funciona mejor con monorepos:

1. Ve a https://render.com
2. **New** → **Web Service**
3. Conecta tu repositorio `yasslinetour`
4. Configura:
   - **Name**: `yassline-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Agrega variables de entorno
6. **Create Web Service**

---

## 🎯 Recomendación

**Usa la Solución 3** (repositorio separado). Es más limpio, más fácil de mantener y evita estos problemas.

¿Cuál opción prefieres? ¿Quieres que te guíe paso a paso con alguna?
