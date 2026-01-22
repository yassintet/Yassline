# Respuesta para MongoDB Support: Organization, Project y Cluster

Soporte te ha pedido confirmar **Organization**, **Project** y **Cluster**. Aquí tienes qué escribir y dónde buscar cada dato.

---

## 1. Dónde encontrar cada dato en Atlas

| Dato | Dónde verlo |
|------|-------------|
| **Organization** | Esquina superior izquierda de [cloud.mongodb.com](https://cloud.mongodb.com), al hacer clic en el nombre. O **Organization Settings** (engranaje) → pestaña **Overview** → "Organization name". |
| **Project** | Selector de proyecto (dropdown) en la barra superior, encima de "Database" / "Deployments". Es el nombre del proyecto donde está el cluster (ej. "Project 0", "Yassline", etc.). |
| **Cluster** | **Database** → **Deployments** → nombre del cluster. En tu caso: **Yassline**. |

---

## 2. Texto que puedes enviar a soporte (copia y pega)

Sustituye `[TU ORGANIZATION]` y `[TU PROJECT]` por los valores reales que ves en Atlas.

```
Organization: [TU ORGANIZATION]
Project: [TU PROJECT]
Cluster: Yassline
```

**Ejemplo** (si tu org se llama "Personal" y el proyecto "Project 0"):

```
Organization: Personal
Project: Project 0
Cluster: Yassline
```

---

## 3. Versión más detallada (opcional)

Si prefieres dar más contexto:

```
- Organization: [TU ORGANIZATION]
- Project: [TU PROJECT]
- Cluster: Yassline

Database: yasslinetour
User: yasslinetour_db_user
```

---

## 4. Resumen

| Campo | Valor |
|-------|--------|
| **Organization** | *(lo ves en la esquina superior izquierda de Atlas o en Organization Settings)* |
| **Project** | *(lo ves en el selector de proyectos encima de Database/Deployments)* |
| **Cluster** | **Yassline** |

Solo **Cluster** está confirmado (Yassline). **Organization** y **Project** debes copiarlos tal como aparecen en tu cuenta de MongoDB Atlas.
