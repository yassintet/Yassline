# ⚙️ Configuración del Archivo .env

## 📍 Ubicación

El archivo `.env` debe estar en: `backend/.env`

---

## 📝 Contenido del Archivo .env

Crea o edita el archivo `backend/.env` con este contenido:

```env
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
NODE_ENV=development
```

---

## 🔧 Cómo Obtener tu MONGO_URI

### Paso 1: Ve a MongoDB Atlas
1. Inicia sesión en https://cloud.mongodb.com/
2. Selecciona tu proyecto
3. Ve a **"Database"** → **"Deployments"**

### Paso 2: Obtener la Cadena de Conexión
1. Click en **"Connect"** en tu cluster
2. Selecciona **"Connect your application"**
3. **Driver**: Node.js
4. **Version**: 5.5 or later
5. **Copia la cadena de conexión**

### Paso 3: Personalizar la Cadena
La cadena que MongoDB te da se ve así:
```
mongodb+srv://<username>:<password>@yassline.v3oycnj.mongodb.net/?retryWrites=true&w=majority
```

**Debes reemplazar:**
- `<username>` → Tu usuario de MongoDB (ej: `yasslinetour_db_user`)
- `<password>` → Tu contraseña
- Agregar el nombre de la base de datos antes del `?`:
  ```
  mongodb+srv://usuario:password@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
  ```

---

## 🔐 Caracteres Especiales en Contraseña

Si tu contraseña tiene caracteres especiales, debes codificarlos:

| Carácter | Código URL |
|----------|------------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| ` ` (espacio) | `%20` |

**Ejemplo:**
- Contraseña original: `Mi@Pass#123`
- En MONGO_URI: `Mi%40Pass%23123`

---

## ✅ Ejemplo Completo

Si tu configuración es:
- **Usuario**: `yasslinetour_db_user`
- **Contraseña**: `yassline2026`
- **Cluster**: `yassline.v3oycnj.mongodb.net`
- **Base de datos**: `yasslinetour`

Tu `.env` debería ser:

```env
PORT=4000
MONGO_URI=mongodb+srv://yasslinetour_db_user:yassline2026@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
NODE_ENV=development
```

---

## 🔍 Verificar tu Configuración Actual

Tu `.env` actual tiene:
```
PORT=4000
MONGO_URI=mongodb://yasslinetour_db_user:yassline2026@ac-nbesxsy-shard-00-00.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-01.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-02.v3oycnj.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-nbesxsy-shard-0
```

**Problemas detectados:**
1. ❌ Falta el nombre de la base de datos en la URL
2. ❌ Usa formato estándar en lugar de `mongodb+srv://`

**Solución:**
Agrega el nombre de la base de datos antes del `?`:

```env
PORT=4000
MONGO_URI=mongodb://yasslinetour_db_user:yassline2026@ac-nbesxsy-shard-00-00.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-01.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-02.v3oycnj.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&replicaSet=atlas-nbesxsy-shard-0
NODE_ENV=development
```

O mejor aún, usa el formato `mongodb+srv://` (más simple):

```env
PORT=4000
MONGO_URI=mongodb+srv://yasslinetour_db_user:yassline2026@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
NODE_ENV=development
```

---

## 🧪 Probar la Configuración

Después de actualizar el `.env`, prueba la conexión:

```powershell
cd backend
npm run test:mongodb
```

O ejecuta el servidor:

```powershell
cd backend
node server.js
```

Deberías ver: `✅ MongoDB Conectado exitosamente`

---

## ⚠️ Importante

1. **NO subas el archivo `.env` a GitHub** (ya está en `.gitignore`)
2. **Mantén tu contraseña segura**
3. **Para producción** (Railway/Render), agrega las variables en el panel de configuración, NO en un archivo

---

## 📝 Para Railway/Render

En Railway o Render, agrega estas variables de entorno:

- **MONGO_URI**: (tu cadena completa)
- **NODE_ENV**: `production`
- **PORT**: (Railway/Render lo asigna automáticamente)
