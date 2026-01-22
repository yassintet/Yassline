# 📋 Crear Índice de Búsqueda en `circuits`

## ⚠️ Importante

El índice que creaste está en `sample_mflix.users` (base de datos de ejemplo).
Necesitas crear **otro índice** en `yasslinetour.circuits` (tu base de datos real).

---

## 🎯 Pasos para Crear el Índice en `circuits`

### 1. Accede a Atlas Search
- Ve a: https://cloud.mongodb.com/
- **Database** → **Deployments** → Tu cluster "Yassline"
- Click en pestaña **"Search"** (o **"Atlas Search"**)

### 2. Crear Nuevo Índice
- Click en **"Create Search Index"**
- Selecciona **"JSON Editor"**

### 3. Configurar la Base de Datos y Colección
**IMPORTANTE:** Asegúrate de seleccionar:
- **Database**: `yasslinetour` (NO `sample_mflix`)
- **Collection**: `circuits` (NO `users`)

Si no ves `yasslinetour` en la lista:
- Verifica que la base de datos existe
- Verifica que la colección `circuits` existe
- Si no existe, créala primero (puede estar vacía)

### 4. Pegar el JSON
Copia y pega este JSON completo:

```json
{
  "name": "default",
  "definition": {
    "mappings": {
      "dynamic": false,
      "fields": {
        "name": {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": true,
          "similarity": {
            "type": "bm25"
          }
        },
        "title": {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": true,
          "similarity": {
            "type": "bm25"
          }
        },
        "description": {
          "type": "string",
          "analyzer": "lucene.standard",
          "similarity": {
            "type": "bm25"
          }
        }
      }
    }
  }
}
```

### 5. Nombre del Índice
- **Index Name**: `default` (o déjalo como está)

### 6. Crear
- Click en **"Next"** → **"Create Search Index"**
- Espera 2-5 minutos a que se cree

---

## ❓ ¿Por qué no aparece `circuits`?

Si no puedes seleccionar `circuits`:

### Opción A: La colección no existe
1. Ve a **Database** → **Browse Collections**
2. Selecciona base de datos `yasslinetour`
3. Si no existe la colección `circuits`, créala:
   - Click **"Create Collection"**
   - Nombre: `circuits`
   - Puede estar vacía, no importa

### Opción B: Estás en la base de datos incorrecta
- Asegúrate de estar en `yasslinetour`, no en `sample_mflix`

---

## ✅ Verificación

Después de crear el índice, deberías ver:
- **Database**: `yasslinetour`
- **Collection**: `circuits`
- **Index Name**: `default`
- **Status**: `Active` (después de unos minutos)

---

## 📝 Nota sobre el Índice en `users`

El índice que creaste en `sample_mflix.users` no es necesario para tu proyecto.
Puedes eliminarlo si quieres:
- Ve a la pestaña **"Search"**
- Encuentra el índice de `sample_mflix.users`
- Click en **"..."** → **"Delete"**

O simplemente déjalo, no afecta tu proyecto.
