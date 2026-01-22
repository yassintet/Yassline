# 🔍 Debug: Problema de Conexión MongoDB

## ✅ Lo que sabemos que está bien:

- ✅ Whitelist configurada: `0.0.0.0/0` Active
- ✅ Conectividad de red: TcpTestSucceeded: True
- ✅ Cluster existe y tiene datos (115.98 MB)
- ✅ Formato de URI: Probado con ambos formatos

## ❌ Error persistente:

```
Server selection timed out after 30000 ms
```

## 🔍 Posibles causas restantes:

### 1. Cluster Pausado (MÁS PROBABLE)

**Verifica:**
1. Database → Deployments → Click en cluster "Yassline"
2. ¿Qué botón ves?
   - **"Resume"** → Cluster está PAUSADO ⏸️
     - Click en "Resume" y espera 2-3 minutos
   - **"Pause"** → Cluster está activo ✅

### 2. Problema de Usuario/Contraseña

**Verifica:**
1. Database Access
2. Usuario: `yasslinetour_db_user`
3. ¿La contraseña es exactamente `yassline2026`?
4. ¿El usuario tiene permisos "Atlas admin" o "Read and write"?

### 3. Problema de Región/Firewall

Tu cluster está en: **GCP / Belgium (europe-west1)**

Algunos firewalls corporativos o ISPs bloquean ciertas regiones.

**Solución temporal:**
- Prueba desde otra red (móvil hotspot, etc.)
- O verifica si hay firewall corporativo

### 4. MongoDB Atlas temporalmente inaccesible

Puede ser un problema temporal de MongoDB Atlas.

**Solución:**
- Espera 5-10 minutos
- Prueba de nuevo

## 🧪 Pruebas Adicionales

### Test con formato mongodb+srv://

He actualizado el `.env` al formato `mongodb+srv://`. Prueba:

```powershell
npm run test:mongodb
```

### Verificar logs de MongoDB Atlas

1. En MongoDB Atlas
2. Ve a "Metrics" o "Activity"
3. ¿Ves intentos de conexión fallidos?
4. Esto confirmaría que está intentando conectarse pero algo falla

## 📋 Checklist Final

- [ ] Cluster NO está pausado (botón dice "Pause", no "Resume")
- [ ] Whitelist tiene `0.0.0.0/0` Active ✅ (Ya verificado)
- [ ] Usuario existe y contraseña es correcta
- [ ] Esperaste 2-3 minutos después de cualquier cambio
- [ ] Probaste desde otra red (opcional)

## 🆘 Si NADA funciona

1. **Crea un nuevo usuario** en Database Access:
   - Username: `test_user`
   - Password: `Test123456` (sin caracteres especiales)
   - Privileges: Atlas admin
   - Prueba con este usuario nuevo

2. **Verifica en los logs de MongoDB Atlas** si hay intentos de conexión

---

**Lo más importante: Verifica si el cluster está pausado. Ese es el problema más común.**

¿Puedes confirmar si en Database → Deployments → Cluster "Yassline" ves el botón "Resume" o "Pause"?
