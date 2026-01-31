# Email en Railway con Resend

En Railway las conexiones SMTP salientes (puertos 25, 587, 465) suelen estar bloqueadas o dar **ETIMEDOUT**. La solución es usar un servicio de email por **API (HTTPS)**.

Este proyecto soporta **Resend**: solo necesitas una API key y no hace falta SMTP.

---

## ⚠️ Plan gratis / testing: solo enviar a tu propio email

En plan **gratis o de pruebas**, Resend **solo permite enviar al email de la cuenta** (el que usaste al registrarte en resend.com). Si intentas enviar a otros (clientes, admin@yassline.com), Resend devuelve **403** con el mensaje:

> "You can only send testing emails to your own email address. To send emails to other recipients, please verify a domain at resend.com/domains."

**Solución:** Verifica tu dominio (yassline.com) en [resend.com/domains](https://resend.com/domains), añade los registros DNS que te indiquen, y luego en Railway pon `RESEND_FROM=Yassline Tour <info@yassline.com>` (o `noreply@yassline.com`). Después de verificar el dominio podrás enviar a cualquier destinatario.

---

## 1. Crear cuenta y API key en Resend

1. Entra en **[resend.com](https://resend.com)** y crea una cuenta (gratis).
2. Ve a **API Keys** → **Create API Key**.
3. Pon un nombre (ej. `Yassline Railway`) y copia la clave (empieza por `re_`).
4. **No la compartas** y guárdala para el paso siguiente.

---

## 2. Configurar variables en Railway

En tu proyecto de Railway → **Variables** (o **Settings → Variables**), añade:

| Variable          | Valor                                                                 |
|-------------------|-----------------------------------------------------------------------|
| `RESEND_API_KEY` | La clave que copiaste (ej. `re_xxxxxxxxxxxxxxxxxxxxxxxx`)             |
| `RESEND_FROM`    | Opcional. Por defecto: `Yassline Tour <onboarding@resend.dev>`        |
| `LOGO_URL`       | Opcional. URL pública del logo para el encabezado del email (fondo oscuro). Por defecto: `FRONTEND_URL/logo-email.png` |

- **Logo en emails:** Sube tu logo (blanco/dorado para fondo oscuro) a tu sitio, por ejemplo en `frontend/public/logo-email.png`. Así quedará en `https://yassline.com/logo-email.png`. Si usas otra ruta, define `LOGO_URL` en Railway con la URL completa.
- Si **no** pones `RESEND_FROM`, los emails saldrán de `onboarding@resend.dev` (válido en plan gratis).
- Si **verificas tu dominio** (yassline.com) en Resend, puedes usar:  
  `RESEND_FROM=Yassline Tour <info@yassline.com>`

Guarda los cambios; Railway redesplegará solo.

---

## 3. Redeploy después de añadir la variable

**Importante:** Después de añadir o cambiar `RESEND_API_KEY` en Railway, el servicio debe **volver a desplegarse** para que la variable se cargue. Si no redepliegas, el proceso que está corriendo sigue con el entorno antiguo (sin la clave).

- En Railway: **Deployments** → clic en los **tres puntos (⋯)** del último deployment → **Redeploy**.
- O haz un **push** a tu repo (aunque sea un cambio pequeño) para que Railway redespliegue.

Tras el redeploy, en los **logs al arrancar** debe salir:
- `📧 RESEND_API_KEY en este proceso: SÍ (emails vía Resend)`
- `📧 Email: resend | Configurado: true`

Si sigue saliendo `RESEND_API_KEY en este proceso: NO`, la variable no está llegando al servicio (revisa que esté en **Variables** del servicio correcto y vuelve a redeploy).

---

## 4. Comprobar que está configurado

- **Al arrancar** el backend, en los logs de Railway debe aparecer:
  - `📧 Email: resend | Configurado: true | Emails se enviarán vía Resend API.`
  - `📧 Remitente: Yassline Tour <onboarding@resend.dev>`
- **Desde el navegador:** abre `https://tu-api.up.railway.app/api/health/email`. Deberías ver `{ "ok": true, "email": { "provider": "resend", "configured": true } }`. Si `configured` es `false`, **RESEND_API_KEY** no está en Railway o está vacía.

## 5. Probar con una reserva

Haz una reserva de prueba en yassline.com. En los logs de Railway deberías ver:

- `📧 Usando Resend API`
- `✅ Email enviado vía Resend: ...`

**Si los emails no se envían (y ves "EMAIL_USER o EMAIL_PASS no están configurados"):**

Eso significa que el backend **no ve** `RESEND_API_KEY`. La variable tiene que estar en el **mismo servicio** que ejecuta la API.

1. **Servicio correcto:** En Railway puedes tener varios servicios (por ejemplo frontend y backend). `RESEND_API_KEY` debe estar en el servicio del **backend** (el que tiene la URL `yassline-production.up.railway.app` y cuyos Deployments son desde GitHub con tu backend Node). Abre **ese** servicio → pestaña **Variables** y comprueba que `RESEND_API_KEY` aparece ahí.
2. **Raw Editor:** En Variables, pulsa **Raw Editor**, revisa que exista la línea `RESEND_API_KEY=re_xxxxxxxx` (tu clave, sin comillas). Si no está, añádela, guarda y haz **Redeploy** del backend.
3. **Comprobar desde fuera:** Abre en el navegador `https://yassline-production.up.railway.app/api/health/email`. Si la respuesta tiene `"configured": false`, el backend sigue sin ver la variable (revisa el punto 1 y 2).
4. **Redeploy:** Después de tocar Variables, haz **Redeploy** del servicio backend (Deployments → ⋯ en el deployment ACTIVE → Redeploy).
2. **Comprueba la variable:** Railway → Variables → `RESEND_API_KEY` debe existir y empezar por `re_` (sin espacios ni comillas).
3. **Remitente en plan gratis:** En plan gratis de Resend solo puedes usar `onboarding@resend.dev`. No pongas `RESEND_FROM` con tu dominio (ej. `info@yassline.com`) a menos que hayas **verificado el dominio** en resend.com. Si no, **no definas RESEND_FROM** o usa: `RESEND_FROM=Yassline Tour <onboarding@resend.dev>`.
4. **Logs al enviar:** Al crear una reserva, si falla verás `❌ Email de notificación (admin) no enviado:` o `❌ Email de confirmación (cliente) no enviado:` seguido del mensaje de error (ej. "RESEND_API_KEY no configurado" o el mensaje de la API de Resend).
5. **Probar estado:** Abre `https://tu-api.up.railway.app/api/health/email`. Debe devolver `{ "ok": true, "email": { "provider": "resend", "configured": true } }`. Si `configured` es `false`, la API key no está configurada.

---

## Resumen

- **RESEND_API_KEY** (obligatorio en Railway para que el email funcione).
- **RESEND_FROM** (opcional; por defecto `onboarding@resend.dev`).
- Sin Resend, el código intenta SMTP (en Railway suele fallar por timeout).

Plan gratis de Resend: 100 emails/día; suficiente para notificaciones de reservas y contacto.
