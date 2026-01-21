# 📤 Guía: Subir Código a GitHub desde Windows

## Paso 2.2: Subir Código desde tu Computadora

### Opción A: Usando PowerShell (Recomendado)

#### Paso 1: Abrir PowerShell en tu Proyecto

1. Abre el **Explorador de Archivos** de Windows
2. Navega a: `C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME`
3. **Click derecho** en la carpeta `YASSLINEPLATFORME`
4. Selecciona **"Abrir en Terminal"** o **"Abrir en PowerShell"**

#### Paso 2: Verificar si Git está Instalado

Escribe en PowerShell:
```powershell
git --version
```

**Si aparece un error** (git no está instalado):
1. Descarga Git desde: https://git-scm.com/download/win
2. Instala Git (siguiente, siguiente, siguiente...)
3. Cierra y vuelve a abrir PowerShell
4. Vuelve a escribir: `git --version`

**Si aparece algo como `git version 2.x.x`** → ¡Perfecto! Continúa.

---

#### Paso 3: Inicializar Git (Solo la Primera Vez)

En PowerShell, escribe estos comandos **uno por uno**:

```powershell
# 1. Inicializar Git
git init
```

Deberías ver: `Initialized empty Git repository...`

---

#### Paso 4: Configurar Git (Solo la Primera Vez)

```powershell
# Configurar tu nombre (reemplaza con tu nombre)
git config --global user.name "Tu Nombre"

# Configurar tu email (usa el email de tu cuenta GitHub)
git config --global user.email "tu-email@ejemplo.com"
```

---

#### Paso 5: Agregar Todos los Archivos

```powershell
# Agregar todos los archivos al repositorio
git add .
```

No verás ningún mensaje, es normal.

---

#### Paso 6: Hacer el Primer Commit

```powershell
# Crear el primer commit
git commit -m "Initial commit - Yassline Tour"
```

Deberías ver algo como: `[main (root-commit) xxxxx] Initial commit...`

---

#### Paso 7: Conectar con GitHub

**IMPORTANTE**: Reemplaza `TU_USUARIO` con tu usuario real de GitHub.

Por ejemplo, si tu usuario de GitHub es `juanperez`, el comando sería:
```powershell
git remote add origin https://github.com/juanperez/yasslinetour.git
```

**¿Cómo saber tu usuario de GitHub?**
- Ve a https://github.com
- Tu usuario aparece en la URL: `https://github.com/TU_USUARIO`

---

#### Paso 8: Cambiar a la Rama Main

```powershell
git branch -M main
```

---

#### Paso 9: Subir el Código

```powershell
git push -u origin main
```

**Aquí puede pasar una de estas cosas:**

##### Opción A: Te pide Usuario y Contraseña
- **Usuario**: Tu usuario de GitHub
- **Contraseña**: NO uses tu contraseña normal, necesitas un **Personal Access Token**

**Cómo crear un Personal Access Token:**
1. Ve a GitHub.com → Click en tu foto (arriba derecha) → **Settings**
2. Baja hasta **Developer settings** (abajo izquierda)
3. Click en **Personal access tokens** → **Tokens (classic)**
4. Click en **Generate new token** → **Generate new token (classic)**
5. **Note**: Escribe "Railway" o "Render"
6. **Expiration**: Selecciona "90 days" o "No expiration"
7. **Selecciona estos permisos**:
   - ✅ `repo` (todo)
8. Click en **Generate token**
9. **COPIA EL TOKEN** (solo lo verás una vez)
10. Cuando PowerShell te pida contraseña, **pega el token** (no tu contraseña)

##### Opción B: Se abre una Ventana del Navegador
- Autoriza GitHub
- Vuelve a PowerShell

##### Opción C: Funciona Directamente
- ¡Perfecto! Tu código está en GitHub

---

### Opción B: Usando GitHub Desktop (Más Fácil - Visual)

Si los comandos te dan problemas, usa GitHub Desktop:

#### Paso 1: Descargar GitHub Desktop
1. Ve a: https://desktop.github.com
2. Descarga e instala GitHub Desktop

#### Paso 2: Iniciar Sesión
1. Abre GitHub Desktop
2. Click en **"Sign in to GitHub.com"**
3. Inicia sesión con tu cuenta

#### Paso 3: Agregar Repositorio Local
1. Click en **"File"** → **"Add Local Repository"**
2. Click en **"Choose..."**
3. Selecciona la carpeta: `C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME`
4. Click en **"Add repository"**

#### Paso 4: Publicar en GitHub
1. En GitHub Desktop, verás todos tus archivos
2. Abajo, en **"Summary"**, escribe: `Initial commit`
3. Click en **"Commit to main"**
4. Click en **"Publish repository"**
5. **Nombre**: `yasslinetour`
6. **Description**: (opcional) "Yassline Tour - Transporte Turístico"
7. **Marca o desmarca** "Keep this code private" (como prefieras)
8. Click en **"Publish Repository"**

¡Listo! Tu código está en GitHub.

---

## ✅ Verificar que Funcionó

1. Ve a https://github.com
2. Deberías ver tu repositorio `yasslinetour`
3. Click en él
4. Deberías ver todas tus carpetas: `backend`, `frontend`, etc.

---

## 🆘 Problemas Comunes

### Error: "fatal: not a git repository"
**Solución**: Ejecuta `git init` primero

### Error: "fatal: remote origin already exists"
**Solución**: 
```powershell
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/yasslinetour.git
```

### Error: "Authentication failed"
**Solución**: Usa un Personal Access Token en lugar de tu contraseña

### Error: "repository not found"
**Solución**: 
1. Verifica que el repositorio existe en GitHub
2. Verifica que el nombre del usuario sea correcto
3. Verifica que tengas permisos en el repositorio

---

## 📝 Resumen de Comandos (Copia y Pega)

**Reemplaza `TU_USUARIO` con tu usuario de GitHub:**

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/yasslinetour.git
git branch -M main
git push -u origin main
```

---

¿En qué paso específico te quedaste? ¿Tienes Git instalado? ¿Ya tienes cuenta de GitHub?
