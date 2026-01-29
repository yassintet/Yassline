# 🚀 Guía: Conectar y Crear MongoDB desde PowerShell

Esta guía te muestra cómo conectarte y crear la base de datos MongoDB directamente desde Windows PowerShell, sin necesidad de usar scripts Node.js complejos.

## 📋 Requisitos Previos

1. **Node.js instalado** (para ejecutar scripts)
   - Verificar: `node --version`
   - Descargar: https://nodejs.org/

2. **MongoDB Shell (mongosh) - Opcional pero recomendado**
   - Verificar: `mongosh --version`
   - Descargar: https://www.mongodb.com/try/download/shell

3. **Archivo `.env` configurado** con `MONGO_URI`

---

## 🔌 Opción 1: Conectar a MongoDB (Solo Conexión)

### Usando MongoDB Shell (mongosh) - Recomendado

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
.\connect-mongodb.ps1
```

Esto te conectará directamente a MongoDB Atlas y podrás ejecutar comandos como:

```javascript
use yasslinetour
show collections
db.circuits.find()
db.circuits.insertOne({ name: "Test", price: 100 })
```

### Usando Node.js (Alternativa)

Si no tienes `mongosh` instalado, el script usará Node.js automáticamente para conectarse.

---

## 🌱 Opción 2: Poblar Base de Datos (Seed)

Ejecuta el script de seed que crea todas las colecciones y datos iniciales:

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
.\seed-database.ps1
```

Este script:
- ✅ Verifica dependencias
- ✅ Carga variables de entorno
- ✅ Ejecuta `scripts/seed.js`
- ✅ Crea circuitos, transportes, vehículos y usuarios

---

## 📊 Opción 3: Crear Colecciones Manualmente

Si prefieres crear las colecciones paso a paso:

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
.\create-collections.ps1
```

---

## 🎯 Comandos Rápidos desde PowerShell

### Conectar directamente con mongosh

```powershell
$env:MONGO_URI = "mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline"
mongosh $env:MONGO_URI
```

### Ejecutar seed directamente con Node.js

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
npm run seed
```

---

## 🔍 Verificar Conexión

### Test rápido de conexión:

```powershell
cd "C:\Users\pc\Desktop\DESARROLLO WEB\YASSLINEPLATFORME\backend"
npm run test:mongodb
```

---

## 📝 Comandos MongoDB Útiles (dentro de mongosh)

Una vez conectado con `mongosh`, puedes usar:

```javascript
// Cambiar a la base de datos
use yasslinetour

// Ver todas las colecciones
show collections

// Ver documentos en una colección
db.circuits.find()
db.transports.find()
db.vehicles.find()
db.users.find()

// Contar documentos
db.circuits.countDocuments()

// Insertar un documento
db.circuits.insertOne({
  name: "Test Circuit",
  price: 100,
  active: true
})

// Eliminar todos los documentos (¡cuidado!)
db.circuits.deleteMany({})

// Ver un documento formateado
db.circuits.findOne()
```

---

## ⚠️ Solución de Problemas

### Error: "mongosh no se reconoce como comando"

**Solución**: Instala MongoDB Shell desde https://www.mongodb.com/try/download/shell

O usa la alternativa con Node.js que se ejecuta automáticamente.

### Error: "ECONNREFUSED" o "querySrv"

**Causas comunes**:
1. Cluster de MongoDB Atlas está **PAUSADO** ⏸️
   - Ve a https://cloud.mongodb.com/
   - Resume el cluster
   - Espera 2-3 minutos

2. IP no está en la whitelist 🔒
   - Ve a Network Access → IP Access List
   - Agrega `0.0.0.0/0` (Allow Access from Anywhere)

### Error: "MONGO_URI no está definida"

**Solución**: Asegúrate de que el archivo `.env` existe y contiene `MONGO_URI`

---

## ✅ Ventajas de Usar PowerShell Directamente

1. ✅ **Más rápido**: Conexión directa sin intermediarios
2. ✅ **Más control**: Puedes ejecutar comandos MongoDB directamente
3. ✅ **Debugging fácil**: Ves los resultados inmediatamente
4. ✅ **Flexible**: Puedes crear/modificar datos sobre la marcha

---

## 📚 Recursos Adicionales

- [MongoDB Shell Documentation](https://www.mongodb.com/docs/mongodb-shell/)
- [MongoDB Atlas Connection Guide](https://www.mongodb.com/docs/atlas/connect-to-cluster/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

**¿Necesitas ayuda?** Ejecuta cualquiera de los scripts y revisa los mensajes de error para diagnóstico.
