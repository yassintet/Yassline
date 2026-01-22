# 🔧 Solución: Error querySrv ECONNREFUSED

## ❌ Error que estás viendo:
```
querySrv ECONNREFUSED _mongodb._tcp.yassline.v3oycnj.mongodb.net
```

Este error significa que **tu IP no está en la whitelist** de MongoDB Atlas.

---

## ✅ Solución: Configurar Whitelist en MongoDB Atlas

### Paso 1: Acceder a Network Access

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión
3. Selecciona tu proyecto
4. En el menú izquierdo, click en **"Network Access"**

### Paso 2: Agregar IP a la Whitelist

**Opción A: Permitir todas las IPs (Recomendado para desarrollo)**

1. Click en el botón verde **"Add IP Address"**
2. Click en **"Allow Access from Anywhere"**
3. Esto agregará: `0.0.0.0/0`
4. Click en **"Confirm"**
5. ⚠️ **Espera 1-2 minutos** para que se active

**Opción B: Agregar tu IP específica**

1. Click en **"Add IP Address"**
2. Click en **"Add Current IP Address"** (si estás en tu computadora)
3. O escribe manualmente tu IP
4. Click en **"Confirm"**

### Paso 3: Verificar que esté Activo

1. En la lista de IPs, deberías ver:
   - `0.0.0.0/0` (Allow Access from Anywhere) - Estado: **Active**
   - O tu IP específica - Estado: **Active**

2. Si dice **"Pending"**, espera 1-2 minutos

---

## 🔍 Verificar que el Cluster esté Activo

1. Ve a **"Database"** → **"Deployments"**
2. Verifica que tu cluster **NO esté pausado**
3. Si está pausado:
   - Click en **"Resume"** o **"Resume Cluster"**
   - Espera 2-3 minutos a que se active

---

## ✅ Probar de Nuevo

Después de agregar la IP a la whitelist y esperar 1-2 minutos:

```powershell
cd backend
npm run test:mongodb
```

Deberías ver:
```
✅ ¡Conexión exitosa!
📊 Información de la conexión:
   Base de datos: yasslinetour
   Host: yassline-shard-00-00.v3oycnj.mongodb.net
🎉 MongoDB está funcionando correctamente!
```

---

## 📸 Pasos Visuales

### En MongoDB Atlas:

1. **Network Access** (menú izquierdo)
2. **IP Access List** (pestaña)
3. **Add IP Address** (botón verde)
4. **Allow Access from Anywhere** (opción)
5. **Confirm**

---

## 🆘 Si sigue fallando después de agregar la IP

### Verifica:

1. ✅ **Cluster activo**: Database → Deployments → Cluster no pausado
2. ✅ **Whitelist configurada**: Network Access → IP Access List → `0.0.0.0/0` está **Active**
3. ✅ **Esperaste 1-2 minutos** después de agregar la IP
4. ✅ **Usuario existe**: Database Access → Verifica que `yasslinetour_db_user` exista
5. ✅ **Contraseña correcta**: Verifica que `yassline2026` sea la contraseña correcta

### Prueba alternativa:

Si `mongodb+srv://` no funciona, prueba con el formato estándar:

```env
MONGO_URI=mongodb://yasslinetour_db_user:yassline2026@ac-nbesxsy-shard-00-00.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-01.v3oycnj.mongodb.net:27017,ac-nbesxsy-shard-00-02.v3oycnj.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&replicaSet=atlas-nbesxsy-shard-0
```

---

## 📝 Checklist Final

- [ ] Cluster está activo (no pausado)
- [ ] Whitelist tiene `0.0.0.0/0` o tu IP
- [ ] Estado de la IP es "Active" (no "Pending")
- [ ] Esperaste 1-2 minutos después de agregar la IP
- [ ] Usuario y contraseña son correctos
- [ ] MONGO_URI tiene el formato correcto

---

**El paso más importante es agregar `0.0.0.0/0` a la whitelist y esperar 1-2 minutos.**

¿Ya agregaste la IP a la whitelist? ¿Cuánto tiempo esperaste después de agregarla?
