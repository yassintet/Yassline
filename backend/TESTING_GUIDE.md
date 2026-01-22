# Guía de Pruebas de la API - Yassline Tour

## Instalación de Dependencias

Primero, instala las dependencias necesarias:

```bash
npm install express-validator jsonwebtoken bcryptjs
```

## Configuración

Asegúrate de tener un archivo `.env` con:

```env
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/yasslinetour?retryWrites=true&w=majority
JWT_SECRET=tu-secret-key-super-segura-aqui-cambiar-en-produccion
NODE_ENV=development
```

## Poblar Base de Datos

Ejecuta el script de seed para crear datos de ejemplo:

```bash
npm run seed
```

Esto creará:
- 3 circuitos de ejemplo
- 4 servicios de transporte
- 3 vehículos
- Usuario admin (username: `admin`, password: `admin123`)
- Usuario de prueba (username: `testuser`, password: `test123`)

## Iniciar el Servidor

```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

---

## Pruebas con cURL

### 1. Autenticación

#### Registrar nuevo usuario
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nuevousuario",
    "email": "nuevo@example.com",
    "password": "password123"
  }'
```

#### Iniciar sesión
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yassline.com",
    "password": "admin123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Guarda el token** para usarlo en las siguientes peticiones:
```bash
export TOKEN="tu-token-aqui"
```

#### Obtener información del usuario actual
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### 2. Circuitos

#### Listar todos los circuitos (público)
```bash
curl -X GET http://localhost:4000/api/circuits
```

#### Filtrar circuitos destacados
```bash
curl -X GET "http://localhost:4000/api/circuits?featured=true&active=true"
```

#### Obtener circuito por ID
```bash
curl -X GET http://localhost:4000/api/circuits/ID_DEL_CIRCUITO
```

#### Obtener circuito por slug
```bash
curl -X GET http://localhost:4000/api/circuits/slug/gran-tour-imperial
```

#### Buscar circuitos
```bash
curl -X GET "http://localhost:4000/api/circuits/search?q=imperial"
```

#### Crear nuevo circuito (requiere autenticación)
```bash
curl -X POST http://localhost:4000/api/circuits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Nuevo Circuito",
    "title": "Título del circuito",
    "description": "Descripción detallada del circuito que debe tener al menos 20 caracteres para pasar la validación.",
    "duration": "3 Días / 2 Noches",
    "price": 250,
    "priceLabel": "Desde 250€ / persona",
    "image": "/images/circuits/nuevo.jpg",
    "itinerary": [
      {
        "day": 1,
        "title": "Día 1",
        "description": "Descripción del primer día"
      }
    ],
    "includes": ["Chofer", "Combustible"],
    "featured": false,
    "active": true
  }'
```

#### Actualizar circuito (requiere autenticación)
```bash
curl -X PUT http://localhost:4000/api/circuits/ID_DEL_CIRCUITO \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 300,
    "featured": true
  }'
```

#### Eliminar circuito (requiere autenticación)
```bash
curl -X DELETE http://localhost:4000/api/circuits/ID_DEL_CIRCUITO \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Transporte

#### Listar servicios de transporte (público)
```bash
curl -X GET http://localhost:4000/api/transport
```

#### Filtrar por tipo
```bash
curl -X GET "http://localhost:4000/api/transport?type=airport&active=true"
```

#### Crear servicio (requiere autenticación)
```bash
curl -X POST http://localhost:4000/api/transport \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "airport",
    "name": "Traslado VIP",
    "description": "Servicio premium de traslado al aeropuerto con todas las comodidades.",
    "icon": "plane",
    "price": 75,
    "priceLabel": "Desde 75€",
    "route": {
      "from": "Aeropuerto",
      "to": "Hotel"
    },
    "active": true
  }'
```

---

### 4. Contacto

#### Enviar mensaje de contacto (público)
```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+34 600 000 000",
    "serviceType": "circuito",
    "message": "Me interesa el Gran Tour Imperial. ¿Podrían darme más información?"
  }'
```

#### Listar mensajes (requiere autenticación)
```bash
curl -X GET http://localhost:4000/api/contact \
  -H "Authorization: Bearer $TOKEN"
```

#### Filtrar por estado
```bash
curl -X GET "http://localhost:4000/api/contact?status=new" \
  -H "Authorization: Bearer $TOKEN"
```

#### Actualizar estado de mensaje (requiere autenticación)
```bash
curl -X PUT http://localhost:4000/api/contact/ID_DEL_MENSAJE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "read",
    "notes": "Cliente interesado en reservar"
  }'
```

---

### 5. Vehículos

#### Listar vehículos (público)
```bash
curl -X GET http://localhost:4000/api/vehicles
```

#### Crear vehículo (requiere autenticación)
```bash
curl -X POST http://localhost:4000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Mercedes E-Class",
    "type": "other",
    "capacity": {
      "passengers": 4,
      "luggage": "2 maletas"
    },
    "description": "Vehículo de lujo para grupos pequeños",
    "image": "/images/fleet/e-class.jpg",
    "features": ["WiFi", "Aire acondicionado"],
    "active": true
  }'
```

---

## Pruebas con Postman

### Configuración

1. **Crear una colección** llamada "Yassline Tour API"
2. **Crear una variable de entorno** `baseUrl` = `http://localhost:4000`
3. **Crear una variable de entorno** `token` (se actualizará después del login)

### Flujo de Pruebas

1. **Login** → Guarda el token en la variable `token`
2. **Configurar Authorization** → En la colección, ve a "Authorization" y selecciona:
   - Type: Bearer Token
   - Token: `{{token}}`
3. **Probar endpoints** → Todas las rutas protegidas usarán automáticamente el token

### Ejemplo de Pre-request Script (para auto-login)

En la colección, agrega un Pre-request Script:

```javascript
// Solo ejecutar si no hay token
if (!pm.environment.get("token")) {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "admin@yassline.com",
                password: "admin123"
            })
        }
    }, function (err, res) {
        if (res.json().success) {
            pm.environment.set("token", res.json().data.token);
        }
    });
}
```

---

## Manejo de Errores

### Error de Autenticación (401)
```json
{
  "success": false,
  "message": "Token de acceso requerido..."
}
```

**Solución:** Inicia sesión y usa el token en el header `Authorization: Bearer <token>`

### Error de Validación (400)
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "msg": "El nombre es requerido",
      "param": "name",
      "location": "body"
    }
  ]
}
```

**Solución:** Revisa los errores y corrige los campos indicados.

### Error de Permisos (403)
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Solución:** El token expiró o es inválido. Inicia sesión nuevamente.

---

## Notas Importantes

1. **Tokens JWT** expiran después de 7 días (configurable en `authController.js`)
2. **Validaciones** están activas en todas las rutas POST/PUT
3. **Rutas públicas** (GET) no requieren autenticación
4. **Rutas protegidas** (POST/PUT/DELETE) requieren token válido
5. **Cambiar contraseñas** de los usuarios de seed en producción

---

## Próximos Pasos

- [ ] Agregar rate limiting
- [ ] Implementar refresh tokens
- [ ] Agregar logging de requests
- [ ] Crear tests automatizados
- [ ] Documentación con Swagger/OpenAPI
