# 🔧 Solución: Timeout de Conexión MongoDB (6+ horas)

## 🔍 Diagnóstico

Después de más de 6 horas con Network Access configurado, la conexión sigue fallando con timeout. Esto indica un problema más profundo que la simple propagación.

---

## ✅ Verificaciones Inmediatas

### 1. Verificar Network Access en MongoDB Atlas

1. Ve a **Network Access**
2. Verifica que `0.0.0.0/0` esté en la lista
3. **IMPORTANTE:** Elimina y vuelve a agregar la IP:
   - Click en "..." → "Delete" en `0.0.0.0/0`
   - Click "Add IP Address"
   - Selecciona "Allow Access from Anywhere"
   - Click "Confirm"
   - Espera 2-3 minutos

### 2. Verificar Firewall de Windows

```powershell
# Verificar estado del firewall
Get-NetFirewallProfile | Select-Object Name, Enabled

# Desactivar temporalmente (SOLO PARA PRUEBA)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

**Después de probar, reactívalo:**
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### 3. Verificar Antivirus

- Desactiva temporalmente tu antivirus
- Prueba la conexión
- Si funciona, agrega excepción para Node.js

### 4. Probar desde Otra Red

1. Conecta tu móvil como hotspot
2. Conecta tu PC al hotspot
3. Prueba la conexión:
   ```powershell
   cd backend
   node test-mongodb.js
   ```

Si funciona desde el hotspot, el problema es tu red local/ISP.

---

## 🧪 Prueba con MongoDB Compass

MongoDB Compass es una herramienta GUI que puede ayudar a diagnosticar:

1. **Descarga MongoDB Compass:**
   - https://www.mongodb.com/products/compass

2. **Conecta usando esta URI:**
   ```
   mongodb+srv://yasslinetour_db_user:4oOKsbXLr2By5I1L@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
   ```

3. **Si Compass puede conectarse:**
   - El problema es con Node.js/Mongoose
   - Prueba actualizar mongoose: `npm install mongoose@latest`

4. **Si Compass NO puede conectarse:**
   - El problema es de red/firewall
   - Sigue con las verificaciones de firewall

---

## 🔄 Solución Alternativa: Usar formato SRV

Prueba cambiar la URI en `.env` a formato SRV:

```env
MONGO_URI=mongodb+srv://yasslinetour_db_user:4oOKsbXLr2By5I1L@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority
```

Luego prueba:
```powershell
node test-mongodb.js
```

---

## 🆘 Si Nada Funciona

### Contactar MongoDB Support

1. Ve a MongoDB Atlas → Support
2. Crea un ticket con esta información:
   - **Problema:** "Connection timeout after 6+ hours with Network Access configured"
   - **Cluster:** Yassline
   - **Network Access:** `0.0.0.0/0` Active
   - **Error:** "Server selection timed out after 30000 ms"
   - **Diagnóstico:** TCP ports accessible, but MongoDB connection fails

### Usar MongoDB Local (Temporal)

Mientras se resuelve, puedes usar MongoDB local para desarrollo:

1. Instala MongoDB Community: https://www.mongodb.com/try/download/community
2. Cambia la URI en `.env` a:
   ```env
   MONGO_URI=mongodb://localhost:27017/yasslinetour
   ```

---

## 📋 Checklist Final

- [ ] Network Access eliminado y vuelto a agregar
- [ ] Firewall de Windows desactivado temporalmente (y probado)
- [ ] Antivirus desactivado temporalmente (y probado)
- [ ] Probado desde hotspot móvil
- [ ] Probado con MongoDB Compass
- [ ] Probado con formato SRV
- [ ] Verificado usuario en Database Access (estado "Active")

---

## 💡 Recomendación

**Si después de todas estas pruebas sigue sin funcionar:**

1. El problema probablemente es tu ISP o red corporativa bloqueando conexiones MongoDB
2. Considera usar MongoDB local para desarrollo
3. O contacta a MongoDB Support para ayuda adicional
