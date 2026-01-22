# Atlas Search Project

Proyecto con el **MongoDB Node.js Driver** (nativo) para pruebas de conexión y **Atlas Search** (índice autocomplete).

Doc: [How to Index Fields for Autocompletion](https://www.mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/).

---

## 1. Connection string

**Atlas Cluster:**

```
mongodb+srv://<db_username>:<db_password>@<clusterName>.<hostname>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Local / Self-Managed:** usa `mongodb://...` según tu despliegue.

Sustituye `<connection-string>` en `create-index.js` o `test-connection.js` por tu URI.

---

## 2. Crear el índice

```powershell
node create-index.js
```

O:

```powershell
npm run create-index
```

Crea un índice **autocomplete** en `yasslinetour.circuits` sobre `name`, `title` y `description`.

---

## 3. Configure autocomplete Field Properties

| Option          | Type    | Default   | Description |
|-----------------|--------|-----------|-------------|
| `type`          | string | required  | `"autocomplete"` |
| `analyzer`      | string | optional  | p. ej. `lucene.standard` (no nGram/edgeGram tokenizers) |
| `minGrams`      | int    | 2         | 2 para edgeGram; 4 recomendado si no |
| `maxGrams`      | int    | 15        | Máximo de caracteres por token |
| `tokenization`  | enum   | edgeGram  | `edgeGram` \| `rightEdgeGram` \| `nGram` |
| `foldDiacritics`| boolean| true      | Normalizar diacríticos (cafè ≈ cafe) |
| `similarity.type` | string | bm25   | `bm25` \| `boolean` \| `stableTfl` |

---

## Scripts

### Test de conexión

```powershell
cd 'C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\atlas-search-project'
npm run test:connection
```

### Crear índice

```powershell
node create-index.js
# o
npm run create-index
```

---

## Configuración

- **URI**: en `create-index.js` y `test-connection.js`.
- **Base / colección**: en `create-index.js`, `databaseName = 'yasslinetour'` y `collectionName = 'circuits'`.
