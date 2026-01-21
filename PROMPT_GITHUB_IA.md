# 🤖 Prompt para IA de GitHub

## Copia y pega este texto a la IA de GitHub:

---

**PROMPT PARA LA IA:**

```
Necesito subir mi proyecto local a GitHub. Por favor, ejecuta estos pasos:

1. Verifica si Git está instalado en el sistema
2. Navega a la carpeta: C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME
3. Inicializa un repositorio Git si no existe
4. Configura Git con estos datos (pregúntame si no los tengo):
   - Nombre: [Mi nombre]
   - Email: [Mi email de GitHub]
5. Agrega todos los archivos al staging
6. Crea un commit inicial con el mensaje "Initial commit - Yassline Tour"
7. Conecta el repositorio local con GitHub (necesitaré proporcionar la URL del repositorio)
8. Sube el código a la rama main

El proyecto tiene esta estructura:
- backend/ (Node.js/Express)
- frontend/ (Next.js)
- Varios archivos de configuración

Por favor, ejecuta los comandos necesarios y guíame si necesitas alguna información adicional como:
- URL del repositorio de GitHub
- Credenciales de autenticación
- Configuración de usuario de Git
```

---

## Versión más específica (si ya tienes el repositorio creado):

```
Ejecuta estos comandos de Git para subir mi proyecto a GitHub:

1. cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME"
2. git init
3. git config user.name "[MI_NOMBRE]"
4. git config user.email "[MI_EMAIL]"
5. git add .
6. git commit -m "Initial commit - Yassline Tour"
7. git remote add origin https://github.com/[MI_USUARIO]/yasslinetour.git
8. git branch -M main
9. git push -u origin main

Reemplaza [MI_NOMBRE], [MI_EMAIL] y [MI_USUARIO] con mis datos reales.
Si necesitas autenticación, guíame para crear un Personal Access Token.
```

---

## Versión para GitHub Copilot Chat (en VS Code/Cursor):

```
Ayúdame a subir mi proyecto Yassline Tour a GitHub. El proyecto está en:
C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME

Estructura:
- backend/ (servidor Node.js con Express)
- frontend/ (aplicación Next.js)
- Archivos de configuración

Necesito:
1. Inicializar Git en esta carpeta
2. Hacer commit de todos los archivos
3. Conectarlo con mi repositorio de GitHub (nombre: yasslinetour)
4. Subir el código

Por favor, genera los comandos Git necesarios y explícame cada paso.
Si necesito configurar algo primero (como usuario de Git o token de acceso), indícamelo.
```

---

## Versión corta y directa:

```
Sube mi proyecto local a GitHub. Carpeta: C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME
Repositorio: https://github.com/[MI_USUARIO]/yasslinetour.git

Ejecuta: git init, git add ., git commit, git remote add origin, git push
```

---

## Instrucciones para usar:

1. **Abre GitHub Copilot** en tu editor (Cursor/VS Code)
2. **Abre el chat** de Copilot (Ctrl+L o Cmd+L)
3. **Pega uno de los prompts** de arriba
4. **Reemplaza** los datos entre corchetes `[MI_USUARIO]`, `[MI_EMAIL]`, etc.
5. **La IA ejecutará** los comandos o te guiará paso a paso

---

## Si usas GitHub CLI (gh):

```
gh repo create yasslinetour --private --source=. --remote=origin --push
```

Este comando crea el repositorio y sube el código en un solo paso.

---

**Elige el prompt que mejor se adapte a tu situación y cópialo a la IA de GitHub.**
