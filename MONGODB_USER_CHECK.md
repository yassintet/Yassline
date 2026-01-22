# 🔍 Verificar Usuario y Contraseña

## ✅ Lo que sabemos:

- ✅ Cluster está **ACTIVO**
- ✅ Whitelist está configurada (`0.0.0.0/0`)
- ✅ Conectividad de red funciona
- ❌ Conexión falla con timeout

## 🔍 Posible causa: Usuario/Contraseña

### Verifica en MongoDB Atlas:

1. Ve a **Database Access** (menú izquierdo)
2. Busca el usuario: `yasslinetour_db_user`
3. Verifica:
   - ¿Existe el usuario?
   - ¿La contraseña es exactamente `yassline2026`?
   - ¿Tiene permisos adecuados? (debe tener "Atlas admin" o "Read and write to any database")

### Si el usuario NO existe o la contraseña está mal:

#### Crear/Verificar Usuario:

1. En **Database Access**, click en **"Add New Database User"**
2. **Authentication Method**: Password
3. **Username**: `yasslinetour_db_user`
4. **Password**: 
   - Si ya existe, puedes resetearla
   - O crea una nueva (ej: `Yassline2026!`)
5. **Database User Privileges**: Selecciona **"Atlas admin"**
6. Click en **"Add User"**
7. ⚠️ **COPIA LA NUEVA CONTRASEÑA** si creaste una

---

## 🧪 Probar con usuario nuevo (si quieres)

Puedes crear un usuario temporal de prueba:

1. **Database Access** → **Add New Database User**
2. Username: `test_user`
3. Password: `Test123456` (sin caracteres especiales)
4. Privileges: **Atlas admin**
5. Agrega al usuario

Luego actualiza el `.env` con:
```
MONGO_URI=mongodb+srv://test_user:Test123456@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

---

**Verifica que el usuario exista y tenga la contraseña correcta en Database Access.**
