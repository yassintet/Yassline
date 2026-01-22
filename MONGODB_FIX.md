# 🔧 Solución: Problemas de Conexión a MongoDB Atlas

## ❌ Error que estás viendo:

```
❌ Error al conectar a MongoDB: Server selection timed out after 5000 ms
```

o

```
❌ Error al conectar a MongoDB: querySrv ECONNREFUSED _mongodb._tcp.yassline.v3oycnj.mongodb.net
```

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que el Cluster esté Activo

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión
3. Selecciona tu proyecto
4. Ve a **"Database"** → **"Deployments"**
5. **Verifica que el cluster NO esté pausado**
   - Si está pausado, click en **"Resume"** o **"Resume Cluster"**
   - Espera 1-2 minutos a que se active

---

### Paso 2: Verificar la Whitelist de IPs

1. En MongoDB Atlas, ve a **"Network Access"** (menú izquierdo)
2. Click en **"IP Access List"**
3. Verifica que tengas una de estas opciones:

   **Opción A: Permitir todas las IPs (Solo para desarrollo)**
   - Click en **"Add IP Address"**
   - Click en **"Allow Access from Anywhere"**
   - Esto agrega `0.0.0.0/0`
   - ⚠️ **Solo para desarrollo/testing**

   **Opción B: Agregar IP específica**
   - Para Railway/Render: Agrega `0.0.0.0/0` (permitir todas)
   - Para tu computadora local: Agrega tu IP actual
   - Puedes ver tu IP en: https://whatismyipaddress.com/

4. Click en **"Confirm"**

---

### Paso 3: Verificar Usuario y Contraseña

1. En MongoDB Atlas, ve a **"Database Access"** (menú izquierdo)
2. Verifica que tu usuario exista
3. Si no existe, crea uno:
   - Click en **"Add New Database User"**
   - **Authentication Method**: Password
   - **Username**: (elige uno, ej: `yassline-admin`)
   - **Password**: (genera uno seguro o crea el tuyo)
   - **Database User Privileges**: "Atlas admin" o "Read and write to any database"
   - Click en **"Add User"**
   - ⚠️ **COPIA LA CONTRASEÑA** (solo la verás una vez)

---

### Paso 4: Obtener la Cadena de Conexión Correcta

1. En MongoDB Atlas, ve a **"Database"** → **"Deployments"**
2. Click en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.5 or later
6. **Copia la cadena de conexión** que aparece

   Debería verse así:
   ```
   mongodb+srv://<username>:<password>@yassline.v3oycnj.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Reemplaza**:
   - `<username>` → Tu usuario de MongoDB
   - `<password>` → Tu contraseña (si tiene caracteres especiales, URL-encodéalos)
   - Agrega el nombre de la base de datos al final:
     ```
     mongodb+srv://usuario:password@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
     ```

---

### Paso 5: Configurar en Railway/Render

#### En Railway:
1. Ve a Railway → Tu proyecto → **Variables**
2. Agrega o edita:
   - **Key**: `MONGO_URI`
   - **Value**: Tu cadena de conexión completa
3. Click en **"Add"** o **"Update"**

#### En Render:
1. Ve a Render → Tu servicio → **Environment**
2. Agrega:
   - **Key**: `MONGO_URI`
   - **Value**: Tu cadena de conexión completa
3. Click en **"Save Changes"**

---

### Paso 6: Probar Localmente

1. Abre tu archivo `.env` en `backend/.env`
2. Agrega:
   ```
   MONGO_URI=mongodb+srv://usuario:password@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
   ```
3. Ejecuta:
   ```powershell
   cd backend
   node server.js
   ```
4. Deberías ver: `✅ MongoDB Conectado exitosamente`

---

## 🔍 Caracteres Especiales en Contraseña

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
- Contraseña: `Mi@Pass#123`
- En MONGO_URI: `Mi%40Pass%23123`

---

## 🆘 Solución de Problemas Específicos

### Error: "Server selection timed out"
- ✅ Verifica que el cluster esté activo
- ✅ Verifica la whitelist de IPs (agrega `0.0.0.0/0`)
- ✅ Verifica que la URL sea correcta

### Error: "Authentication failed"
- ✅ Verifica usuario y contraseña
- ✅ Codifica caracteres especiales en la contraseña
- ✅ Verifica que el usuario tenga permisos

### Error: "querySrv ECONNREFUSED"
- ✅ Verifica que el cluster esté activo (no pausado)
- ✅ Verifica la whitelist de IPs
- ✅ Verifica el formato de la URL

### Error: "IP not whitelisted"
- ✅ Agrega `0.0.0.0/0` a la whitelist (para desarrollo)
- ✅ O agrega la IP específica de Railway/Render

---

## ✅ Formato Correcto de MONGO_URI

```
mongodb+srv://USUARIO:CONTRASEÑA@yassline.v3oycnj.mongodb.net/NOMBRE_DATABASE?retryWrites=true&w=majority
```

**Ejemplo completo:**
```
mongodb+srv://yassline-admin:MiPassword123@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
```

---

## 📝 Checklist Final

- [ ] Cluster está activo (no pausado)
- [ ] Whitelist tiene `0.0.0.0/0` o la IP correcta
- [ ] Usuario existe y tiene permisos
- [ ] Contraseña está correctamente codificada (si tiene caracteres especiales)
- [ ] MONGO_URI tiene el formato correcto
- [ ] Nombre de la base de datos está en la URL
- [ ] Variables de entorno están configuradas en Railway/Render

---

**¿En qué paso específico necesitas ayuda? Comparte el error exacto que ves.**
