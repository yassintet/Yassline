# 🎯 Crear Índice de Búsqueda via MongoDB Atlas UI

Si el script de Node.js no funciona debido a problemas de conexión, puedes crear el índice directamente desde la interfaz web de MongoDB Atlas.

## 📋 Pasos

### 1. Accede a MongoDB Atlas
- Ve a https://cloud.mongodb.com/
- Inicia sesión en tu cuenta

### 2. Navega a Atlas Search
- Click en **"Database"** → **"Deployments"**
- Selecciona tu cluster **"Yassline"**
- Click en la pestaña **"Search"** (o **"Atlas Search"**)

### 3. Crear el Índice
- Click en **"Create Search Index"**
- Selecciona **"JSON Editor"** (en lugar de Visual Editor)
- Copia y pega el siguiente JSON:

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

### 4. Configurar la Colección
- **Database**: `yasslinetour`
- **Collection**: `circuits`
- **Index Name**: `default` (o déjalo como está)

### 5. Crear el Índice
- Click en **"Next"** → **"Create Search Index"**
- Espera a que el índice se cree (puede tomar unos minutos)

## ✅ Verificación

Una vez creado, deberías ver el índice en la lista con estado **"Active"**.

## 🔍 Notas

- Este método NO requiere conexión desde Node.js
- Funciona directamente desde la interfaz web
- Es la forma más confiable si tienes problemas de red
