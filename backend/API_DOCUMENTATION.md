# Yassline Tour API Documentation

## Base URL
```
http://localhost:4000/api
```

## Endpoints

### Circuitos (`/api/circuits`)

#### GET `/api/circuits`
Lista todos los circuitos.

**Query Parameters:**
- `featured` (boolean): Filtrar por circuitos destacados
- `active` (boolean): Filtrar por circuitos activos

**Ejemplo:**
```bash
GET /api/circuits?active=true&featured=true
```

**Respuesta:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

#### GET `/api/circuits/:id`
Obtiene un circuito por ID.

**Ejemplo:**
```bash
GET /api/circuits/507f1f77bcf86cd799439011
```

#### GET `/api/circuits/slug/:slug`
Obtiene un circuito por slug (URL amigable).

**Ejemplo:**
```bash
GET /api/circuits/slug/gran-tour-imperial
```

#### GET `/api/circuits/search?q=query`
Búsqueda de circuitos por nombre, título o descripción.

**Ejemplo:**
```bash
GET /api/circuits/search?q=imperial
```

#### POST `/api/circuits`
Crea un nuevo circuito.

**Body:**
```json
{
  "name": "Gran Tour Imperial",
  "title": "Descubre los tesoros imperiales",
  "description": "Un viaje inolvidable...",
  "duration": "5 Días / 4 Noches",
  "price": 450,
  "priceLabel": "Desde 450€ / persona",
  "image": "/images/circuits/imperial.jpg",
  "itinerary": [
    {
      "day": 1,
      "title": "Llegada a Marrakech",
      "description": "Recepción en el aeropuerto..."
    }
  ],
  "includes": ["Chofer privado", "Combustible", "Hoteles"],
  "featured": true,
  "active": true
}
```

#### PUT `/api/circuits/:id`
Actualiza un circuito existente.

#### DELETE `/api/circuits/:id`
Elimina un circuito.

---

### Transporte (`/api/transport`)

#### GET `/api/transport`
Lista todos los servicios de transporte.

**Query Parameters:**
- `type` (string): Filtrar por tipo (`airport`, `intercity`, `hourly`, `custom`)
- `active` (boolean): Filtrar por servicios activos

**Ejemplo:**
```bash
GET /api/transport?type=airport&active=true
```

#### GET `/api/transport/:id`
Obtiene un servicio por ID.

#### POST `/api/transport`
Crea un nuevo servicio.

**Body:**
```json
{
  "type": "airport",
  "name": "Traslado Aeropuerto",
  "description": "Servicio de traslado desde/hacia el aeropuerto",
  "icon": "plane",
  "price": 50,
  "priceLabel": "Desde 50€",
  "route": {
    "from": "Aeropuerto Marrakech",
    "to": "Centro de Marrakech"
  },
  "active": true
}
```

#### PUT `/api/transport/:id`
Actualiza un servicio.

#### DELETE `/api/transport/:id`
Elimina un servicio.

---

### Contacto (`/api/contact`)

#### POST `/api/contact`
Envía un mensaje de contacto (público).

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 600 000 000",
  "serviceType": "circuito",
  "message": "Me interesa el Gran Tour Imperial"
}
```

**serviceType:** `transporte`, `circuito`, `hotel`, `otro`

#### GET `/api/contact`
Lista todos los mensajes (protegido).

**Query Parameters:**
- `status` (string): Filtrar por estado (`new`, `read`, `replied`, `archived`)

#### GET `/api/contact/:id`
Obtiene un mensaje por ID.

#### PUT `/api/contact/:id`
Actualiza el estado de un mensaje.

**Body:**
```json
{
  "status": "read",
  "notes": "Cliente interesado en reservar"
}
```

#### DELETE `/api/contact/:id`
Elimina un mensaje.

---

### Vehículos (`/api/vehicles`)

#### GET `/api/vehicles`
Lista todos los vehículos.

**Query Parameters:**
- `active` (boolean): Filtrar por vehículos activos

#### GET `/api/vehicles/:id`
Obtiene un vehículo por ID.

#### POST `/api/vehicles`
Crea un nuevo vehículo.

**Body:**
```json
{
  "name": "Mercedes V-Class",
  "type": "v-class",
  "capacity": {
    "passengers": 7,
    "luggage": "2 maletas grandes"
  },
  "description": "Vehículo de lujo con todas las comodidades",
  "image": "/images/fleet/v-class.jpg",
  "features": ["WiFi", "Aire acondicionado", "Asientos de cuero"],
  "active": true
}
```

**type:** `v-class`, `vito`, `sprinter`, `other`

#### PUT `/api/vehicles/:id`
Actualiza un vehículo.

#### DELETE `/api/vehicles/:id`
Elimina un vehículo.

---

## Modelos de Datos

### Circuit
```javascript
{
  name: String (required),
  title: String (required),
  description: String (required),
  duration: String (required),
  price: Number (required, min: 0),
  priceLabel: String,
  image: String,
  itinerary: [{
    day: Number,
    title: String,
    description: String
  }],
  includes: [String],
  slug: String (unique, auto-generated),
  featured: Boolean (default: false),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Transport
```javascript
{
  type: String (enum: ['airport', 'intercity', 'hourly', 'custom']),
  name: String (required),
  description: String (required),
  icon: String,
  price: Number,
  priceLabel: String,
  route: {
    from: String,
    to: String
  },
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Contact
```javascript
{
  name: String (required),
  email: String (required, validated),
  phone: String,
  serviceType: String (enum: ['transporte', 'circuito', 'hotel', 'otro']),
  message: String (required),
  status: String (enum: ['new', 'read', 'replied', 'archived'], default: 'new'),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle
```javascript
{
  name: String (required, unique),
  type: String (enum: ['v-class', 'vito', 'sprinter', 'other']),
  capacity: {
    passengers: Number (required, min: 1),
    luggage: String
  },
  description: String,
  image: String,
  features: [String],
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Respuestas de Error

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos del error"
}
```

**Códigos de estado HTTP:**
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación o solicitud incorrecta
- `404`: Recurso no encontrado
- `500`: Error del servidor

---

## Notas

- Todas las rutas POST, PUT y DELETE están actualmente sin protección. Se recomienda agregar middleware de autenticación para producción.
- Los slugs de circuitos se generan automáticamente a partir del nombre.
- Los timestamps (`createdAt`, `updatedAt`) se generan automáticamente por Mongoose.
