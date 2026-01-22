# 🔧 Solución: Error "Dockerfile `Docker` does not exist"

## Problema
Railway no está detectando el Dockerfile o hay un problema con la configuración del builder.

## Soluciones

### Solución 1: Eliminar railway.json (Recomendado)

Railway debería detectar automáticamente el Dockerfile sin necesidad de `railway.json`.

1. **Elimina o renombra `railway.json`:**
   ```powershell
   git rm railway.json
   # O renómbralo:
   git mv railway.json railway.json.bak
   ```

2. **Sube los cambios:**
   ```powershell
   git commit -m "Remove railway.json to let Railway auto-detect Dockerfile"
   git push origin main
   ```

3. **En Railway Dashboard:**
   - Ve a **Settings** → **Deploy**
   - Railway debería detectar automáticamente el Dockerfile
   - El builder debería cambiar a **DOCKER** automáticamente

### Solución 2: Configurar Manualmente en Railway

Si la Solución 1 no funciona:

1. **En Railway Dashboard:**
   - Ve a **Settings** → **Deploy**
   - **Root Directory**: (vacío - raíz del proyecto)
   - **Build Command**: (vacío - Docker lo maneja)
   - **Start Command**: (vacío - Docker lo maneja)
   - **Builder**: Selecciona **DOCKER** (no DOCKERFILE, no NIXPACKS)

2. **Elimina el deployment actual y crea uno nuevo**

### Solución 3: Verificar que el Dockerfile esté en la Raíz

Asegúrate de que el Dockerfile esté en la raíz del repositorio (no en `backend/`):

```
YASSLINEPLATFORME/
├── Dockerfile          ← Debe estar aquí
├── backend/
│   ├── server.js
│   └── package.json
├── package.json
└── ...
```

### Solución 4: Simplificar el Dockerfile

Si sigue fallando, prueba con un Dockerfile más simple:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --production

# Copiar código
COPY backend/ ./backend/

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Ejecutar servidor
WORKDIR /app/backend
CMD ["node", "server.js"]
```

## Verificación

Después de aplicar la solución:

1. **Los logs deberían mostrar:**
   ```
   Building Docker image...
   Step 1/7 : FROM node:18-alpine
   ```

2. **NO deberías ver:**
   - "Error creating build plan with Railpack"
   - "Dockerfile `Docker` does not exist"
   - "Using Railpack builder"

## Pasos Recomendados

1. ✅ Elimina `railway.json` (o renómbralo)
2. ✅ Asegúrate de que `Dockerfile` esté en la raíz
3. ✅ Sube los cambios a GitHub
4. ✅ En Railway, elimina el deployment fallido
5. ✅ Crea un nuevo deployment
6. ✅ Railway debería detectar el Dockerfile automáticamente
