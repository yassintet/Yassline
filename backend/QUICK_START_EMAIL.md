# Guía Rápida: Configuración de Email

## ✅ Paso 1: Dependencias Instaladas

Las dependencias `nodemailer` y `pdfkit` ya están instaladas.

## ⚙️ Paso 2: Configurar Variables de Entorno

Crea o edita el archivo `.env` en la carpeta `backend/` con las siguientes variables:

### Opción A: Gmail (Recomendado para desarrollo)

```env
# Email Configuration - Gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail

# O alternativamente:
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-gmail

# Configuración de la empresa
COMPANY_NAME=Yassline Tour
COMPANY_EMAIL=info@yassline.com
COMPANY_ADDRESS=Marruecos
COMPANY_PHONE=+212 XXX XXX XXX
ADMIN_EMAIL=admin@yassline.com
```

### Opción B: SMTP Personalizado

```env
# Email Configuration - SMTP Personalizado
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

## 🔑 Paso 3: Obtener App Password de Gmail (si usas Gmail)

1. Ve a: https://myaccount.google.com/
2. Activa la **Verificación en 2 pasos** si no está activada
3. Ve a **Seguridad** → **Contraseñas de aplicaciones**
4. Selecciona "Correo" y "Otro (nombre personalizado)"
5. Escribe "Yassline Tour API"
6. Copia la contraseña generada (16 caracteres)
7. Úsala en `EMAIL_PASS` o `GMAIL_APP_PASSWORD`

## 🧪 Paso 4: Probar el Sistema

### Probar Formulario de Contacto

1. Ve a `http://localhost:3000/contacto`
2. Completa y envía el formulario
3. Verifica que recibas:
   - Email de confirmación en tu email
   - Email de notificación en `ADMIN_EMAIL`

### Probar Reserva

1. Ve a cualquier página de servicio (ej: `http://localhost:3000/transporte/[id]`)
2. Completa el formulario de reserva
3. Verifica que recibas:
   - Email de confirmación de solicitud
   - Email de notificación en `ADMIN_EMAIL`

### Confirmar Reserva (desde API o Admin Panel)

```bash
# Obtener token de autenticación primero
POST /api/auth/login
{
  "email": "admin@yassline.com",
  "password": "tu-password"
}

# Confirmar reserva (esto enviará email con factura)
PUT /api/bookings/:id/confirm
Authorization: Bearer YOUR_TOKEN
{
  "total": 500
}
```

## 📧 Tipos de Emails Enviados

1. **Formulario de Contacto**
   - ✅ Notificación al admin
   - ✅ Confirmación al cliente

2. **Solicitud de Reserva**
   - ✅ Notificación al admin
   - ✅ Confirmación al cliente

3. **Reserva Confirmada**
   - ✅ Email de confirmación al cliente
   - ✅ Factura PDF adjunta

## ⚠️ Notas Importantes

- Los emails se envían de forma asíncrona (no bloquean la respuesta)
- Si falla el envío de email, se registra en consola pero no afecta la operación
- Las facturas se generan automáticamente al confirmar una reserva
- Los números de reserva e factura se generan automáticamente

## 🐛 Solución de Problemas

### Error: "Invalid login"
- Verifica que `EMAIL_USER` y `EMAIL_PASS` sean correctos
- Si usas Gmail, asegúrate de usar una App Password, no tu contraseña normal

### Error: "Connection timeout"
- Verifica tu conexión a internet
- Si usas SMTP personalizado, verifica que el puerto y host sean correctos

### No se reciben emails
- Revisa la carpeta de spam
- Verifica los logs del servidor para ver errores
- Asegúrate de que las variables de entorno estén correctamente configuradas

## 📝 Variables de Entorno Requeridas

Mínimo necesario para que funcione:
- `EMAIL_USER` o `GMAIL_USER`
- `EMAIL_PASS` o `GMAIL_APP_PASSWORD`
- `ADMIN_EMAIL` (opcional, por defecto: admin@yassline.com)
- `COMPANY_EMAIL` (opcional, por defecto: info@yassline.com)
