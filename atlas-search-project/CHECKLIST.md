# ✅ Checklist: Verificar Configuración MongoDB Atlas

## 1. Network Access ✅
- [x] IP `0.0.0.0/0` agregada
- [x] Estado: "Active"

**Nota:** Aunque está "Active", puede tardar 3-5 minutos más en propagarse completamente.

---

## 2. Verificar Estado del Cluster

Ve a MongoDB Atlas y verifica:

1. **Database** → **Deployments**
2. Busca tu cluster "Yassline"
3. Verifica que el estado sea **"Active"** (no "Paused" o "Starting")

Si está pausado:
- Click en el cluster
- Click en "..." (menú)
- Selecciona "Resume" o "Resume Cluster"
- Espera 2-3 minutos a que se active

---

## 3. Verificar Usuario de Base de Datos

1. Ve a **Security** → **Database Access**
2. Busca el usuario: `yasslinetour_db_user`
3. Verifica que:
   - Estado: **"Active"** (no "Disabled")
   - Permisos: Tiene acceso a la base de datos `yasslinetour`

---

## 4. Esperar Propagación

Después de configurar Network Access:
- ⏱️ Espera **5-10 minutos** (a veces tarda más)
- Luego prueba de nuevo: `npm run verify`

---

## 5. Alternativa Inmediata: Interfaz Web

Si necesitas crear el índice AHORA, usa la interfaz web:

1. Ve a **Database** → **Deployments** → Tu cluster
2. Click en pestaña **"Search"**
3. Click **"Create Search Index"**
4. Selecciona **"JSON Editor"**
5. Copia el JSON de `create-index-via-atlas-ui.md`
6. Database: `yasslinetour`, Collection: `circuits`
7. Click **"Create"**

Esto funciona **sin necesidad de conexión desde Node.js**.

---

## 6. Si Nada Funciona

### Verificar Firewall Local
- Prueba desactivar temporalmente Windows Firewall
- Prueba desactivar antivirus temporalmente
- Verifica que no haya un proxy bloqueando

### Verificar desde Otra Red
- Prueba desde tu móvil como hotspot
- Esto descarta problemas de red local

### Contactar Soporte
Si después de 10-15 minutos sigue sin funcionar:
- Contacta MongoDB Support
- Menciona: "Network Access configurado pero conexión timeout"
