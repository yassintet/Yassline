# 🗄️ Crear Base de Datos `yasslinetour` y Colección `circuits`

## 📋 Situación Actual

La base de datos `yasslinetour` no existe en MongoDB Atlas.
Necesitas crearla primero antes de poder crear el índice de búsqueda.

---

## ✅ Solución: Crear Base de Datos y Colección

### Opción 1: Desde la Interfaz Web (MÁS FÁCIL)

#### Paso 1: Crear la Base de Datos y Colección

1. **Ve a MongoDB Atlas**
   - https://cloud.mongodb.com/
   - **Database** → **Browse Collections**

2. **Crear Base de Datos**
   - Si no ves ninguna base de datos, click en **"Create Database"**
   - **Database Name**: `yasslinetour`
   - **Collection Name**: `circuits`
   - Click **"Create"**

3. **Si ya tienes otras bases de datos:**
   - Click en **"Create Database"** (botón verde)
   - **Database Name**: `yasslinetour`
   - **Collection Name**: `circuits`
   - Click **"Create"**

#### Paso 2: Insertar un Documento de Prueba (Opcional)

Para que la colección quede "establecida", puedes insertar un documento de prueba:

1. Click en la colección `circuits` que acabas de crear
2. Click en **"Insert Document"**
3. Pega este JSON:

```json
{
  "name": "Circuito de Prueba",
  "title": "Test",
  "description": "Documento de prueba para inicializar la colección"
}
```

4. Click **"Insert"**

**Nota:** Esto es opcional, pero ayuda a que la colección esté "activa".

#### Paso 3: Crear el Índice de Búsqueda

Ahora que la base de datos y colección existen:

1. Ve a **Database** → **Deployments** → Tu cluster
2. Click en pestaña **"Search"**
3. Click **"Create Search Index"**
4. Selecciona:
   - **Database**: `yasslinetour` (ahora debería aparecer)
   - **Collection**: `circuits`
5. Selecciona **"JSON Editor"**
6. Pega este JSON:

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

7. **Index Name**: `default`
8. Click **"Next"** → **"Create Search Index"**

---

### Opción 2: Usar Script (Cuando la Conexión Funcione)

Una vez que la conexión desde Node.js funcione, puedes usar este script para crear la base de datos y colección automáticamente.

---

## ✅ Verificación

Después de crear todo, deberías ver:

1. **En Browse Collections:**
   - Base de datos: `yasslinetour`
   - Colección: `circuits`

2. **En Search Indexes:**
   - Database: `yasslinetour`
   - Collection: `circuits`
   - Index: `default`
   - Status: `Active` (después de unos minutos)

---

## 💡 Nota Importante

En MongoDB, las bases de datos y colecciones se crean automáticamente cuando insertas el primer documento. Pero para crear índices de búsqueda desde la interfaz web, es mejor crearlas explícitamente primero.

---

## 🎯 Resumen de Pasos

1. ✅ Crear base de datos `yasslinetour`
2. ✅ Crear colección `circuits`
3. ✅ (Opcional) Insertar documento de prueba
4. ✅ Crear índice de búsqueda en `circuits`

¡Listo! Después de esto, tu índice estará funcionando.
