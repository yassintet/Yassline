# 🔧 Configurar MongoDB para Desarrollo Local

## ✅ Lo que ya está configurado:

- ✅ Archivo `.env` actualizado con tu información de MongoDB
- ✅ Usuario: `yasslinetour_db_user`
- ✅ Cluster: `yassline.v3oycnj.mongodb.net`
- ✅ Base de datos: `yasslinetour`

## 📝 Lo que necesitas hacer:

### Paso 1: Obtener tu contraseña de MongoDB

Tienes 2 opciones:

#### Opción A: Desde MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Inicia sesión
3. Ve a **Database Access** → **Database Users**
4. Busca el usuario `yasslinetour_db_user`
5. Click en **Edit** → **Show Password** o resetea la contraseña

#### Opción B: Desde Railway (si es la misma)
1. Ve a tu proyecto en [Railway](https://railway.app)
2. Ve a **Variables** del servicio backend
3. Busca `MONGO_URI`
4. Copia la contraseña de la URI (está después de `:` y antes de `@`)

### Paso 2: Actualizar el archivo `.env`

Abre `backend/.env` y reemplaza `TU_PASSWORD_AQUI` con tu contraseña real:

```env
MONGO_URI=mongodb+srv://yasslinetour_db_user:TU_CONTRASEÑA_AQUI@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

**Ejemplo:**
```env
MONGO_URI=mongodb+srv://yasslinetour_db_user:MiPassword123@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

### Paso 3: Verificar la conexión

```powershell
cd backend
node verify-db.js
```

Si funciona, verás:
```
✅ Conectado a MongoDB
📊 Base de datos: yasslinetour
📊 Resumen de documentos:
   Circuitos: X
   Transportes: X
   Vehículos: X
   Usuarios: X
```

### Paso 4: Si la base de datos está vacía

```powershell
npm run seed
```

Esto creará:
- 3 vehículos (V-Class, Vito, Sprinter)
- 3 circuitos turísticos
- 4 servicios de transporte
- Usuarios admin y testuser

## ⚠️ IMPORTANTE - Seguridad

- ✅ Este `.env` **SOLO afecta tu entorno local** (`localhost:3000` y `localhost:4000`)
- ✅ **NO afecta** `yassline.com` ni Railway
- ✅ Railway usa sus propias variables de entorno (ya configuradas)
- ✅ El archivo `.env` está en `.gitignore` (no se sube a Git)

## 🚀 Después de configurar

1. **Iniciar backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Iniciar frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Verificar vehículos:**
   - Abre `http://localhost:3000/vehiculos`
   - Deberías ver los 3 vehículos

## ❓ Problemas comunes

### Error: "Cannot connect to MongoDB"
- Verifica que tu contraseña sea correcta
- Verifica que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el usuario `yasslinetour_db_user` tenga permisos

### Error: "Base de datos vacía"
- Ejecuta `npm run seed` para poblar datos de ejemplo

### No puedo acceder a los vehículos
- Verifica que el backend esté corriendo (`npm run dev`)
- Verifica que haya vehículos en la BD (`node verify-db.js`)
- Si no hay vehículos, ejecuta `npm run seed`

## 📞 ¿Necesitas ayuda?

Si tienes problemas:
1. Verifica la consola del navegador (F12)
2. Verifica los logs del backend
3. Ejecuta `node verify-db.js` para diagnosticar
