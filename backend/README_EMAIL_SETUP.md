# Sistema de Notificaciones por Email

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Opción 1: Gmail (recomendado para desarrollo)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail

# O usar:
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-gmail

# Opción 2: SMTP personalizado
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-usuario-smtp
SMTP_PASS=tu-password-smtp

# Configuración de la empresa
COMPANY_NAME=Yassline Tour
COMPANY_EMAIL=info@yassline.com
COMPANY_ADDRESS=Marruecos
COMPANY_PHONE=+212 XXX XXX XXX
ADMIN_EMAIL=admin@yassline.com
```

### 2. Configurar Gmail App Password

Si usas Gmail, necesitas crear una "App Password":

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones → Generar nueva contraseña
4. Copia la contraseña generada y úsala en `EMAIL_PASS` o `GMAIL_APP_PASSWORD`

### 3. Instalar Dependencias

```bash
cd backend
npm install nodemailer pdfkit
```

## Funcionalidades Implementadas

### 1. Formulario de Contacto
- ✅ Notificación al administrador cuando se envía un mensaje
- ✅ Confirmación automática al cliente

### 2. Solicitudes de Reserva
- ✅ Notificación al administrador cuando se crea una reserva
- ✅ Confirmación automática al cliente

### 3. Confirmación de Reserva
- ✅ Email de confirmación al cliente cuando se confirma una reserva
- ✅ Generación automática de factura en PDF
- ✅ Factura adjunta al email de confirmación

### 4. Notificaciones Administrativas
- ✅ Alertas automáticas al equipo cuando hay nuevas solicitudes

## Endpoints

### Reservas (Bookings)

- `POST /api/bookings` - Crear nueva solicitud de reserva (público)
- `GET /api/bookings` - Listar todas las reservas (requiere autenticación)
- `GET /api/bookings/:id` - Obtener reserva por ID (requiere autenticación)
- `PUT /api/bookings/:id` - Actualizar reserva (requiere autenticación)
- `PUT /api/bookings/:id/confirm` - Confirmar reserva y enviar factura (requiere autenticación)
- `DELETE /api/bookings/:id` - Eliminar reserva (requiere autenticación)

## Uso

### Crear una Reserva

```javascript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '+212 6XX XXX XXX',
    serviceName: 'Traslado Aeropuerto',
    serviceType: 'airport',
    serviceId: '507f1f77bcf86cd799439011',
    fecha: '2026-01-25',
    hora: '10:00',
    pasajeros: 2,
    priceLabel: 'Desde 40€',
    calculatedPrice: 435,
    mensaje: 'Necesito ayuda con el equipaje',
  }),
});
```

### Confirmar una Reserva

```javascript
const response = await fetch('/api/bookings/507f1f77bcf86cd799439011/confirm', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN',
  },
  body: JSON.stringify({
    total: 500, // Precio final confirmado
  }),
});
```

## Estructura de Archivos

```
backend/
├── services/
│   ├── emailService.js      # Servicio de envío de emails
│   └── invoiceService.js    # Generación de facturas PDF
├── models/
│   └── Booking.js           # Modelo de reservas
├── controllers/
│   └── bookingController.js # Controlador de reservas
└── routes/
    └── bookingRoutes.js     # Rutas de reservas
```

## Notas

- Los emails se envían de forma asíncrona y no bloquean la respuesta de la API
- Si falla el envío de email, se registra en la consola pero no afecta la operación principal
- Las facturas se generan automáticamente cuando se confirma una reserva
- Los números de reserva e factura se generan automáticamente
