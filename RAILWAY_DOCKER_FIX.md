# 🔧 Solución: Forzar Docker en Railway

## Cambios Realizados

1. ✅ **railway.json** - Cambiado builder a `"DOCKER"`
2. ✅ **.nixpacks.toml** - Renombrado a `.nixpacks.toml.bak` (para que Railway no lo detecte)
3. ✅ **Dockerfile** - Optimizado y listo para usar

## Pasos en Railway

### Opción 1: Configuración Automática (Recomendado)

1. **Sube los cambios a GitHub:**
   ```powershell
   git add railway.json .nixpacks.toml.bak
   git commit -m "Force Docker builder in Railway"
   git push origin main
   ```

2. **En Railway Dashboard:**
   - Ve a tu proyecto → **Settings** → **Deploy**
   - Railway debería detectar automáticamente el Dockerfile
   - El builder debería cambiar a **DOCKER** automáticamente

3. **Si no cambia automáticamente:**
   - Ve a **Settings** → **Deploy**
   - En **Builder**, selecciona manualmente **DOCKER**
   - Guarda los cambios

### Opción 2: Configuración Manual

Si Railway sigue intentando usar Railpack:

1. **Elimina el deployment actual** (si existe)
2. **Ve a Settings → Deploy:**
   - **Root Directory**: (vacío)
   - **Build Command**: (vacío - Docker lo maneja)
   - **Start Command**: (vacío - Docker lo maneja)
   - **Builder**: Selecciona **DOCKER** explícitamente

3. **Crea un nuevo deployment:**
   - Railway debería detectar el Dockerfile
   - El build debería usar Docker ahora

## Verificación

Después del deploy, los logs deberían mostrar:
```
Building Docker image...
Step 1/7 : FROM node:18-alpine
Step 2/7 : WORKDIR /app
...
Successfully built [image-id]
```

**NO deberías ver:**
- "Using Railpack builder"
- "Error creating build plan with Railpack"
- "Using Nixpacks builder"

## Si Aún Falla

1. **Verifica que el Dockerfile esté en la raíz** del repositorio
2. **Verifica que railway.json tenga `"builder": "DOCKER"`**
3. **Elimina cualquier archivo `.nixpacks.toml`** (ya renombrado a `.bak`)
4. **En Railway, elimina el servicio y créalo de nuevo** para forzar la detección
