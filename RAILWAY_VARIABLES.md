# 🔐 Variables de Entorno para Railway

## Variables Requeridas

Configura estas variables en **Railway → Tu Proyecto → Variables → New Variable**:

### 1. PORT (Opcional - Railway lo asigna automáticamente)
```
PORT=4000
```
**Nota:** Railway asigna el puerto automáticamente, pero puedes dejarlo en 4000 por si acaso.

---

### 2. MONGO_URI (OBLIGATORIA)
```
MONGO_URI=mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

**⚠️ IMPORTANTE:**
- Reemplaza `STCYcH8pvIwy3Sbo` con tu contraseña real de MongoDB si es diferente
- Si tu contraseña tiene caracteres especiales (@, #, $, etc.), debes codificarlos:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `/` → `%2F`
  - `:` → `%3A`

**Ejemplo si tu contraseña es `Mi@Pass#123`:**
```
MONGO_URI=mongodb+srv://yasslinetour_db_user:Mi%40Pass%23123@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

---

### 3. JWT_SECRET (OBLIGATORIA)
```
JWT_SECRET=yassline-tour-secret-key-production-railway-2024-change-this
```

**⚠️ IMPORTANTE:**
- Cambia esto por una clave secreta única y segura
- Debe ser una cadena larga y aleatoria (mínimo 32 caracteres)
- Puedes generar una con: `openssl rand -base64 32` o usar un generador online

**Ejemplo de una clave segura:**
```
JWT_SECRET=a7f3b9c2d4e6f8a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b
```

---

### 4. NODE_ENV (Recomendada)
```
NODE_ENV=production
```

---

### 5. MONGO_PASSWORD (Opcional - solo si la necesitas)
```
MONGO_PASSWORD=STCYcH8pvIwy3Sbo
```

**Nota:** Esta variable no es necesaria si `MONGO_URI` ya incluye la contraseña.

---

## 📋 Checklist de Configuración

- [ ] `MONGO_URI` configurada correctamente (con contraseña codificada si tiene caracteres especiales)
- [ ] `JWT_SECRET` configurada con una clave única y segura
- [ ] `NODE_ENV` configurada como `production`
- [ ] `PORT` configurada (opcional, Railway lo asigna automáticamente)

---

## 🔍 Cómo Verificar en Railway

1. Ve a tu proyecto en Railway
2. Click en **Variables** (en el menú lateral)
3. Verifica que todas las variables estén configuradas
4. Asegúrate de que no haya espacios extra al inicio o final de los valores

---

## ⚠️ Errores Comunes

### Error: "MongoDB connection failed"
- Verifica que `MONGO_URI` esté correcta
- Asegúrate de que la contraseña esté codificada si tiene caracteres especiales
- Verifica que MongoDB Atlas permita conexiones desde cualquier IP (`0.0.0.0/0`)

### Error: "JWT_SECRET is not defined"
- Asegúrate de que `JWT_SECRET` esté configurada en Variables

### Error: "Authentication failed"
- Verifica que la contraseña en `MONGO_URI` sea correcta
- Verifica que el usuario `yasslinetour_db_user` exista en MongoDB Atlas

---

## 🛠️ Cómo Codificar Caracteres Especiales en la URL

Si tu contraseña tiene caracteres especiales, usa esta tabla:

| Carácter | Código URL |
|----------|------------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `/` | `%2F` |
| `:` | `%3A` |
| `?` | `%3F` |
| `&` | `%26` |
| `=` | `%3D` |
| `+` | `%2B` |
| `%` | `%25` |
| ` ` (espacio) | `%20` |

**Ejemplo:**
- Contraseña original: `Mi@Pass#123`
- Contraseña codificada: `Mi%40Pass%23123`
- URI completa: `mongodb+srv://usuario:Mi%40Pass%23123@cluster.mongodb.net/database`

---

## 📝 Formato Final de MONGO_URI

```
mongodb+srv://[usuario]:[contraseña-codificada]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority&appName=Yassline
```

**Tu URI actual (si la contraseña es correcta):**
```
mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```
