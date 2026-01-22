# ⚡ Variables de Entorno - Configuración Rápida

## Copia y Pega estas Variables en Railway

Ve a **Railway → Tu Proyecto → Variables → New Variable** y agrega:

### Variable 1: MONGO_URI
**Nombre:** `MONGO_URI`  
**Valor:** 
```
mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

### Variable 2: JWT_SECRET
**Nombre:** `JWT_SECRET`  
**Valor:** 
```
yassline-tour-secret-key-production-railway-2024-change-this-to-something-secure
```
⚠️ **Cambia esto por una clave única y segura**

### Variable 3: NODE_ENV
**Nombre:** `NODE_ENV`  
**Valor:** 
```
production
```

### Variable 4: PORT (Opcional)
**Nombre:** `PORT`  
**Valor:** 
```
4000
```
⚠️ Railway asigna el puerto automáticamente, pero puedes dejarlo.

---

## ✅ Verificación

Después de agregar las variables, verifica:

1. ✅ Todas las variables están en la lista
2. ✅ No hay espacios extra al inicio/final
3. ✅ `MONGO_URI` tiene la contraseña correcta
4. ✅ `JWT_SECRET` es única y segura

---

## 🔧 Si tu Contraseña de MongoDB Tiene Caracteres Especiales

Si tu contraseña tiene `@`, `#`, `$`, etc., codifícalos:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

**Ejemplo:** Si tu contraseña es `Mi@Pass#123`, la URI sería:
```
mongodb+srv://yasslinetour_db_user:Mi%40Pass%23123@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```
