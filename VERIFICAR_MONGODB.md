# 🔍 Guía Visual: Verificar Estado de MongoDB Atlas

## ❌ Error Actual
```
Server selection timed out after 30000 ms
```

La conectividad de red funciona, así que el problema es **configuración en MongoDB Atlas**.

---

## ✅ PASO 1: Verificar si el Cluster está PAUSADO

### En MongoDB Atlas:

1. Ve a https://cloud.mongodb.com/
2. Inicia sesión
3. Selecciona tu proyecto
4. Click en **"Database"** (menú izquierdo)
5. Click en **"Deployments"**

### ¿Qué ves?

**Opción A: Cluster está PAUSADO** ⏸️
- Verás el cluster con un ícono de **pausa** ⏸️
- Verás un botón **"Resume"** o **"Resume Cluster"**
- **SOLUCIÓN**: 
  1. Click en **"Resume"** o **"Resume Cluster"**
  2. Espera 2-3 minutos
  3. Verás una notificación cuando esté activo
  4. Prueba la conexión de nuevo

**Opción B: Cluster está ACTIVO** ▶️
- Verás el cluster normal
- Verás un botón **"Pause"** (no "Resume")
- ✅ **El cluster está bien**, continúa al Paso 2

---

## ✅ PASO 2: Verificar Whitelist de IPs

### En MongoDB Atlas:

1. Click en **"Network Access"** (menú izquierdo)
2. Click en **"IP Access List"** (si no estás ahí ya)

### ¿Qué ves en la lista?

**Si la lista está VACÍA o NO tienes `0.0.0.0/0`:**

1. Click en el botón verde **"Add IP Address"**
2. Click en **"Allow Access from Anywhere"**
3. Esto agregará: `0.0.0.0/0`
4. Click en **"Confirm"**
5. ⏰ **Espera 1-2 minutos**

**Si ya tienes `0.0.0.0/0`:**

- Verifica que el **Estado** sea **"Active"** (no "Pending")
- Si está "Pending", espera 1-2 minutos más

---

## ✅ PASO 3: Verificar Usuario

### En MongoDB Atlas:

1. Click en **"Database Access"** (menú izquierdo)
2. Busca el usuario: `yasslinetour_db_user`

### ¿Existe el usuario?

**Si NO existe:**
1. Click en **"Add New Database User"**
2. **Authentication Method**: Password
3. **Username**: `yasslinetour_db_user`
4. **Password**: `yassline2026` (o genera uno nuevo)
5. **Database User Privileges**: "Atlas admin"
6. Click en **"Add User"**
7. ⚠️ **COPIA LA CONTRASEÑA** si generaste una nueva

**Si SÍ existe:**
- ✅ El usuario está bien
- Verifica que tenga permisos adecuados

---

## 🧪 Después de Verificar

### Espera 2 minutos después de cualquier cambio

Luego ejecuta:

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
npm run test:mongodb
```

---

## 📋 Checklist Rápido

Por favor, verifica y marca:

- [ ] Cluster está **ACTIVO** (botón dice "Pause", no "Resume")
- [ ] Whitelist tiene `0.0.0.0/0` con estado **"Active"**
- [ ] Usuario `yasslinetour_db_user` existe
- [ ] Esperaste 2 minutos después de cambiar algo

---

## 🆘 Si TODO está correcto y sigue fallando

Puede ser un problema temporal. Prueba:

1. **Espera 5 minutos** (a veces Atlas necesita más tiempo)
2. **Verifica tu conexión a internet**
3. **Intenta desde otro dispositivo/red** (si es posible)

---

**Por favor, verifica el Paso 1 primero (estado del cluster). Ese suele ser el problema más común.**
