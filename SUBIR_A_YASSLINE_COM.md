# Subir Build a yassline.com (Hostinger)

## Estado actual

✅ **Build completado:** `frontend/out/` (exportación estática)  
✅ **Zip creado:** `frontend/yassline-hostinger.zip` (85.84 MB)  
✅ **Configuración:** `.env.production` con URLs correctas, `.htaccess` incluido

---

## Pasos para subir a Hostinger

### Opción A: Subir con FileZilla (FTP/SFTP)

1. **Conectar a Hostinger**
   - Abre FileZilla
   - Host: `ftp.yassline.com` (o el host SFTP que te dio Hostinger)
   - Usuario: tu usuario FTP de Hostinger
   - Contraseña: tu contraseña FTP
   - Puerto: 21 (FTP) o 22 (SFTP)

2. **Navegar a la carpeta del dominio**
   - En el panel derecho (servidor), ve a: `/public_html/` o `/domains/yassline.com/public_html/`

3. **Limpiar archivos antiguos (opcional pero recomendado)**
   - Haz backup de la carpeta actual si quieres (descárgala a tu PC)
   - Borra todo el contenido de `public_html/` EXCEPTO:
     - `.htaccess` (si tiene configuración especial de Hostinger)
     - `cgi-bin/` (si existe)
     - Cualquier carpeta de email o subdominio

4. **Subir el nuevo build**
   - **Opción 1:** Sube el zip `yassline-hostinger.zip` y descomprímelo en el servidor (si Hostinger tiene esa opción en el File Manager)
   - **Opción 2:** Extrae `yassline-hostinger.zip` en tu PC y sube TODO el contenido de la carpeta `out/` a `public_html/`

5. **Verificar que se subió correctamente**
   - Debe haber en `public_html/`:
     - `index.html`
     - `.htaccess`
     - `_next/` (carpeta con JS y CSS)
     - `img/` (imágenes, incluidos los iconos de vehículos)
     - `admin.html`, `contacto.html`, etc.
     - `manifest.json`, `robots.txt`, `browserconfig.xml`

---

### Opción B: Subir con File Manager de Hostinger

1. **Acceder al panel de Hostinger**
   - Ve a hPanel de Hostinger
   - Entra en "File Manager" (Administrador de Archivos)

2. **Navegar a public_html**
   - Abre la carpeta `public_html/` (o la carpeta raíz de yassline.com)

3. **Limpiar y subir**
   - Borra los archivos antiguos (excepto .htaccess si tiene config especial)
   - Sube `yassline-hostinger.zip`
   - Haz clic derecho en el zip y selecciona "Extract" (Extraer)
   - Mueve el contenido de la carpeta extraída a la raíz de `public_html/`

---

## Verificación post-subida

1. **Abrir yassline.com en el navegador**
   - Haz Ctrl+Shift+R (hard refresh) para limpiar caché
   - Verifica que:
     - La página principal carga correctamente
     - Los iconos de vehículos (vito, sprinter, clase s) se ven en los desplegables
     - El diseño (negro, dorado, crema) está aplicado
     - Los enlaces funcionan (transporte, vehículos, circuitos, contacto, login, etc.)

2. **Probar funcionalidad**
   - Motor de búsqueda (Tipo de Servicio, Tipo de Vehículo)
   - Navegación entre páginas
   - Formulario de contacto
   - Login/Register (debe conectar con el backend en Railway)

3. **Revisar consola del navegador (F12)**
   - No debe haber errores 404 para archivos JS/CSS
   - No debe haber errores de CORS (el backend debe permitir yassline.com)

---

## Troubleshooting

### Si los estilos no cargan (página blanca o sin CSS)
- Verifica que `_next/static/css/` se subió correctamente
- Verifica que `.htaccess` está en la raíz de `public_html/`
- Limpia caché del navegador (Ctrl+Shift+R)

### Si las imágenes no cargan
- Verifica que `img/` se subió con todos los archivos (v-class1.jpg, icon vito.png, etc.)
- Verifica permisos de la carpeta img/ (755 o 775)

### Si el backend no responde
- Verifica que el backend en Railway está activo: `https://yassline-production.up.railway.app`
- Verifica que el backend permite CORS desde `https://yassline.com`

### Si las rutas dinámicas dan 404
- Verifica que `.htaccess` está en la raíz y tiene las reglas de rewrite
- Verifica que el módulo `mod_rewrite` está activo en Hostinger (suele estarlo por defecto)

---

## Resumen

📦 **Archivo listo:** `frontend/yassline-hostinger.zip` (85.84 MB)  
📂 **Contenido:** Todo el build estático de Next.js con `.htaccess` incluido  
🌐 **Destino:** `public_html/` en Hostinger (yassline.com)  
🚀 **Backend:** Ya está en Railway (`yassline-production.up.railway.app`)

Una vez subido, abre `https://yassline.com` y verifica que todo funciona.
