# Cluster Yassline M0 – Configuración correcta

**Problema detectado:** La app usaba nodos y replica set de **otro** cluster (`ac-nbesxsy`, `atlas-nbesxsy-shard-0`).  
El cluster **Yassline M0** usa:

- **cluster_hostname:** `yassline.v3oycnj.mongodb.net`
- **Primary node:** `ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net`
- **Shards:** `ac-mzstv7l-shard-00-00.aw7fb7q.mongodb.net`, `...-01...`, `...-02...`

*Cualquier otro valor indica que la aplicación no apunta a este cluster.*

---

## Connection string (SRV únicamente)

Usa **solo** el formato SRV. No uses el formato "standard" con nodos concretos; ese apuntaba a otro cluster.

**Plantilla (Atlas):**

```
mongodb+srv://yasslinetour_db_user:<db_password>@yassline.v3oycnj.mongodb.net/?appName=Yassline
```

**Con base de datos y opciones:**

```
mongodb+srv://yasslinetour_db_user:<db_password>@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
```

Sustituye `<db_password>` por tu contraseña real.

---

## backend/.env

En `backend/.env` define:

```
PORT=4000
MONGO_URI=mongodb+srv://yasslinetour_db_user:TU_PASSWORD@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline
NODE_ENV=development
```

**Importante:** Si antes tenías `MONGO_URI` con `mongodb://...ac-nbesxsy-shard-00-...` o `replicaSet=atlas-nbesxsy-shard-0`, **cámbialo** por la URI SRV de arriba.

---

## Comprobar conexión

Desde `backend`:

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
npm run test:connection
```

O desde `atlas-search-project`:

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\atlas-search-project"
npm run verify
```

---

## Enlaces

- [Detalle del cluster Yassline](https://cloud.mongodb.com/v2/696fed8e58c68fde768f0cc4#/clusters/detail/Yassline)
