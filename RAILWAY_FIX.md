# 🔧 Solución de Error: "Error creating build plan with Railpack"

## Problema
Railway está intentando usar Railpack en lugar de Nixpacks, causando un error al crear el build plan.

## Solución

### Opción 1: Configurar Railway para usar Nixpacks explícitamente

1. **En Railway Dashboard:**
   - Ve a tu proyecto → **Settings** → **Deploy**
   - En **Build Command**, deja vacío (Railway usará `.nixpacks.toml`)
   - En **Start Command**, escribe: `cd backend && node server.js`
   - En **Builder**, selecciona **NIXPACKS** (no Railpack)

2. **O configura manualmente en Settings:**
   - **Root Directory**: (vacío - raíz del proyecto)
   - **Build Command**: (vacío - usa `.nixpacks.toml`)
   - **Start Command**: `cd backend && node server.js`

### Opción 2: Usar el Root Directory del backend

Si la Opción 1 no funciona, cambia el root directory:

1. **En Railway Dashboard:**
   - Ve a **Settings** → **Deploy**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install --production`
   - **Start Command**: `node server.js`
   - **Builder**: NIXPACKS

### Opción 3: Crear un package.json válido en la raíz

Si Railway sigue teniendo problemas, crea un `package.json` en la raíz que apunte al backend:

```json
{
  "name": "yassline",
  "version": "1.0.0",
  "scripts": {
    "start": "cd backend && node server.js",
    "install": "cd backend && npm install"
  },
  "engines": {
    "node": ">=18.x"
  }
}
```

## Pasos Recomendados

1. **Elimina el build actual** en Railway (si existe)
2. **Verifica que `.nixpacks.toml` esté en la raíz** del proyecto
3. **Configura explícitamente NIXPACKS** en Settings → Deploy → Builder
4. **Haz un nuevo deploy**

## Verificación

Después de configurar, los logs deberían mostrar:
```
Using Nixpacks builder
Detected Node.js project
Installing dependencies...
```

Si ves "Using Railpack builder", entonces Railway no está usando la configuración correcta.
