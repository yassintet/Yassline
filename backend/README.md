# Yassline Tour - Backend API

API REST para la plataforma Yassline Tour construida con Node.js, Express y MongoDB.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

Si hay problemas con npm cache, instala manualmente:

```bash
npm install express-validator jsonwebtoken bcryptjs
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/yasslinetour?retryWrites=true&w=majority
JWT_SECRET=tu-secret-key-super-segura-aqui
NODE_ENV=development
```

### 3. Poblar Base de Datos (Opcional)

Ejecuta el script de seed para crear datos de ejemplo:

```bash
npm run seed
```

Esto creará:
- 3 circuitos de ejemplo
- 4 servicios de transporte
- 3 vehículos
- Usuario admin: `admin` / `admin123`
- Usuario de prueba: `testuser` / `test123`

### 4. Iniciar Servidor

```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

---

## 📚 Documentación

- **[API Documentation](./API_DOCUMENTATION.md)** - Documentación completa de endpoints
- **[Testing Guide](./TESTING_GUIDE.md)** - Guía de pruebas con cURL y Postman

---

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

### Obtener Token

```bash
POST /api/auth/login
{
  "email": "admin@yassline.com",
  "password": "admin123"
}
```

### Usar Token

Incluye el token en el header `Authorization`:

```
Authorization: Bearer <tu-token>
```

---

## 🛡️ Seguridad

- ✅ Rutas POST/PUT/DELETE protegidas con autenticación JWT
- ✅ Validación de datos con express-validator
- ✅ Contraseñas hasheadas con bcryptjs
- ✅ CORS configurado para producción
- ⚠️ **IMPORTANTE**: Cambia `JWT_SECRET` y contraseñas por defecto en producción

---

## 📁 Estructura del Proyecto

```
backend/
├── controllers/       # Lógica de negocio
│   ├── authController.js
│   ├── circuitController.js
│   ├── contactController.js
│   ├── transportController.js
│   └── vehicleController.js
├── middleware/      # Middlewares personalizados
│   ├── auth.js      # Autenticación JWT
│   └── validation.js # Validaciones express-validator
├── models/          # Modelos Mongoose
│   ├── Circuit.js
│   ├── Contact.js
│   ├── Transport.js
│   ├── User.js
│   └── Vehicle.js
├── routes/          # Definición de rutas
│   ├── authRoutes.js
│   ├── circuitRoutes.js
│   ├── contactRoutes.js
│   ├── transportRoutes.js
│   └── vehicleRoutes.js
├── scripts/         # Scripts utilitarios
│   └── seed.js      # Poblar base de datos
├── server.js        # Servidor principal
└── package.json
```

---

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (protegido)

### Circuitos
- `GET /api/circuits` - Listar circuitos (público)
- `GET /api/circuits/:id` - Obtener circuito (público)
- `GET /api/circuits/slug/:slug` - Obtener por slug (público)
- `GET /api/circuits/search?q=query` - Buscar (público)
- `POST /api/circuits` - Crear (protegido)
- `PUT /api/circuits/:id` - Actualizar (protegido)
- `DELETE /api/circuits/:id` - Eliminar (protegido)

### Transporte
- `GET /api/transport` - Listar servicios (público)
- `POST /api/transport` - Crear servicio (protegido)
- `PUT /api/transport/:id` - Actualizar (protegido)
- `DELETE /api/transport/:id` - Eliminar (protegido)

### Contacto
- `POST /api/contact` - Enviar mensaje (público)
- `GET /api/contact` - Listar mensajes (protegido)
- `PUT /api/contact/:id` - Actualizar estado (protegido)

### Vehículos
- `GET /api/vehicles` - Listar vehículos (público)
- `POST /api/vehicles` - Crear vehículo (protegido)
- `PUT /api/vehicles/:id` - Actualizar (protegido)
- `DELETE /api/vehicles/:id` - Eliminar (protegido)

---

## 🧪 Testing

Ver [TESTING_GUIDE.md](./TESTING_GUIDE.md) para ejemplos completos con cURL y Postman.

### Ejemplo Rápido

```bash
# 1. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yassline.com","password":"admin123"}'

# 2. Usar el token (reemplaza TOKEN con el token recibido)
export TOKEN="tu-token-aqui"

# 3. Crear circuito
curl -X POST http://localhost:4000/api/circuits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Circuit",
    "title": "Test Title",
    "description": "Esta es una descripción de prueba que tiene más de 20 caracteres",
    "duration": "2 días",
    "price": 100
  }'
```

---

## 📝 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo (nodemon)
- `npm run seed` - Poblar base de datos con datos de ejemplo

---

## 🔧 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **express-validator** - Validación de datos
- **CORS** - Cross-Origin Resource Sharing

---

## ⚠️ Notas de Producción

1. **Cambiar JWT_SECRET** por una clave segura y aleatoria
2. **Cambiar contraseñas** de usuarios por defecto
3. **Configurar CORS** con los dominios correctos
4. **Usar HTTPS** en producción
5. **Implementar rate limiting** para prevenir abusos
6. **Agregar logging** y monitoreo
7. **Configurar variables de entorno** en el servidor de producción

---

## 📞 Soporte

Para más información, consulta:
- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
