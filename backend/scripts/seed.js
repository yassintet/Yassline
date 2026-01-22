require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Circuit = require('../models/Circuit');
const Transport = require('../models/Transport');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Datos de ejemplo
const sampleCircuits = [
  {
    name: 'Gran Tour Imperial',
    title: 'Descubre los tesoros imperiales de Marruecos',
    description: 'Un viaje inolvidable a través de las ciudades imperiales de Marruecos. Descubre la rica historia y cultura de Fez, Meknes, Rabat y Marrakech mientras disfrutas de paisajes espectaculares y experiencias auténticas.',
    duration: '5 Días / 4 Noches',
    price: 450,
    priceLabel: 'Desde 450€ / persona',
    image: '/images/circuits/imperial.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Marrakech',
        description: 'Recepción en el aeropuerto y traslado al hotel. Tarde libre para explorar la ciudad.',
      },
      {
        day: 2,
        title: 'Marrakech - Fez',
        description: 'Salida temprano hacia Fez atravesando las montañas del Atlas. Llegada y alojamiento.',
      },
      {
        day: 3,
        title: 'Visita de Fez',
        description: 'Día completo explorando la medina de Fez, una de las ciudades medievales mejor conservadas del mundo.',
      },
      {
        day: 4,
        title: 'Fez - Meknes - Rabat',
        description: 'Visita a Meknes y continuación hacia Rabat, capital de Marruecos.',
      },
      {
        day: 5,
        title: 'Rabat - Marrakech',
        description: 'Regreso a Marrakech con paradas en puntos de interés. Fin del tour.',
      },
    ],
    includes: [
      'Chofer privado',
      'Combustible',
      'Hoteles 4 estrellas',
      'Desayunos',
      'Guía local en Fez',
    ],
    featured: true,
    active: true,
  },
  {
    name: 'Desierto de Merzouga',
    title: 'Aventura en las dunas del Sahara',
    description: 'Vive una experiencia única en el desierto del Sahara. Pasea en camello al atardecer, duerme bajo las estrellas en un campamento bereber y disfruta de la hospitalidad del desierto.',
    duration: '3 Días / 2 Noches',
    price: 320,
    priceLabel: 'Desde 320€ / persona',
    image: '/images/circuits/desert.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Marrakech - Ouarzazate - Merzouga',
        description: 'Salida hacia el desierto atravesando el Alto Atlas. Llegada a Merzouga al atardecer.',
      },
      {
        day: 2,
        title: 'Merzouga - Campamento en el desierto',
        description: 'Paseo en camello por las dunas. Noche en campamento bereber con cena y música tradicional.',
      },
      {
        day: 3,
        title: 'Merzouga - Marrakech',
        description: 'Amanecer en las dunas. Regreso a Marrakech.',
      },
    ],
    includes: [
      'Chofer privado',
      'Combustible',
      'Campamento en el desierto',
      'Paseo en camello',
      'Cenas y desayunos',
    ],
    featured: true,
    active: true,
  },
  {
    name: 'Costa Atlántica',
    title: 'Playas y ciudades costeras',
    description: 'Descubre la costa atlántica de Marruecos, desde Casablanca hasta Essaouira. Disfruta de playas, ciudades históricas y deliciosa gastronomía de mariscos.',
    duration: '4 Días / 3 Noches',
    price: 380,
    priceLabel: 'Desde 380€ / persona',
    image: '/images/circuits/coast.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Marrakech - Casablanca',
        description: 'Salida hacia Casablanca. Visita a la mezquita Hassan II y paseo por la cornisa.',
      },
      {
        day: 2,
        title: 'Casablanca - Rabat - Asilah',
        description: 'Visita rápida a Rabat y continuación hacia Asilah, ciudad costera con murallas portuguesas.',
      },
      {
        day: 3,
        title: 'Asilah - Essaouira',
        description: 'Llegada a Essaouira, ciudad declarada Patrimonio de la Humanidad. Tarde libre.',
      },
      {
        day: 4,
        title: 'Essaouira - Marrakech',
        description: 'Mañana libre en Essaouira. Regreso a Marrakech por la tarde.',
      },
    ],
    includes: [
      'Chofer privado',
      'Combustible',
      'Hoteles 3-4 estrellas',
      'Desayunos',
    ],
    featured: false,
    active: true,
  },
];

const sampleTransports = [
  {
    type: 'airport',
    name: 'Traslado Aeropuerto',
    description: 'Servicio de traslado desde/hacia el aeropuerto de Marrakech. Disponible 24/7 con vehículos cómodos y seguros.',
    icon: 'plane',
    price: 50,
    priceLabel: 'Desde 50€',
    route: {
      from: 'Aeropuerto Marrakech',
      to: 'Centro de Marrakech',
    },
    active: true,
  },
  {
    type: 'intercity',
    name: 'Traslado Interciudades',
    description: 'Conecta las principales ciudades de Marruecos con comodidad y seguridad. Ideal para viajes de negocios o turismo.',
    icon: 'map-pin',
    price: 150,
    priceLabel: 'Desde 150€',
    route: {
      from: 'Marrakech',
      to: 'Fez / Casablanca / Rabat',
    },
    active: true,
  },
  {
    type: 'hourly',
    name: 'Servicio por Horas',
    description: 'Alquila un vehículo con chofer por horas. Perfecto para tours personalizados, compras o eventos.',
    icon: 'clock',
    price: 40,
    priceLabel: 'Desde 40€/hora',
    route: {
      from: 'Marrakech',
      to: 'Personalizado',
    },
    active: true,
  },
  {
    type: 'custom',
    name: 'Servicio Personalizado',
    description: 'Crea tu propio itinerario. Te ayudamos a diseñar el viaje perfecto según tus necesidades.',
    icon: 'route',
    price: 0,
    priceLabel: 'Consultar precio',
    route: {
      from: 'A medida',
      to: 'A medida',
    },
    active: true,
  },
];

const sampleVehicles = [
  {
    name: 'Mercedes V-Class',
    type: 'v-class',
    capacity: {
      passengers: 7,
      luggage: '2 maletas grandes',
    },
    description: 'Vehículo de lujo con todas las comodidades. Ideal para grupos pequeños que buscan máximo confort.',
    image: '/images/fleet/v-class.jpg',
    features: [
      'WiFi gratuito',
      'Aire acondicionado',
      'Asientos de cuero',
      'Pantallas de entretenimiento',
      'Cargadores USB',
    ],
    active: true,
  },
  {
    name: 'Mercedes Vito',
    type: 'vito',
    capacity: {
      passengers: 8,
      luggage: '3 maletas medianas',
    },
    description: 'Vehículo espacioso y confortable, perfecto para familias o grupos medianos.',
    image: '/images/fleet/vito.jpg',
    features: [
      'WiFi gratuito',
      'Aire acondicionado',
      'Asientos reclinables',
      'Cargadores USB',
    ],
    active: true,
  },
  {
    name: 'Mercedes Sprinter',
    type: 'sprinter',
    capacity: {
      passengers: 16,
      luggage: '8 maletas grandes',
    },
    description: 'Vehículo de gran capacidad para grupos grandes. Equipado con todas las comodidades modernas.',
    image: '/images/fleet/sprinter.jpg',
    features: [
      'WiFi gratuito',
      'Aire acondicionado',
      'Asientos cómodos',
      'Espacio amplio para equipaje',
      'Sistema de sonido',
    ],
    active: true,
  },
];

// Función para generar slug desde el nombre
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final
};

// Función para poblar la base de datos
const seedDatabase = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar colecciones existentes (opcional - comentar si quieres mantener datos)
    console.log('🧹 Limpiando colecciones...');
    await Circuit.deleteMany({});
    await Transport.deleteMany({});
    await Vehicle.deleteMany({});
    
    // Generar slugs para los circuitos antes de insertar
    const circuitsWithSlugs = sampleCircuits.map(circuit => ({
      ...circuit,
      slug: generateSlug(circuit.name)
    }));
    
    // Insertar circuitos
    console.log('📦 Insertando circuitos...');
    const circuits = await Circuit.insertMany(circuitsWithSlugs);
    console.log(`✅ ${circuits.length} circuitos insertados`);
    
    // Insertar transportes
    console.log('📦 Insertando servicios de transporte...');
    const transports = await Transport.insertMany(sampleTransports);
    console.log(`✅ ${transports.length} servicios de transporte insertados`);
    
    // Insertar vehículos
    console.log('📦 Insertando vehículos...');
    const vehicles = await Vehicle.insertMany(sampleVehicles);
    console.log(`✅ ${vehicles.length} vehículos insertados`);
    
    // Crear usuario admin si no existe
    console.log('👤 Verificando usuario admin...');
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@yassline.com',
        password: 'admin123', // Cambiar en producción
        role: 'admin',
        active: true,
      });
      await admin.save();
      console.log('✅ Usuario admin creado (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }
    
    // Crear usuario de prueba
    const testUserExists = await User.findOne({ username: 'testuser' });
    if (!testUserExists) {
      const testUser = new User({
        username: 'testuser',
        email: 'test@yassline.com',
        password: 'test123',
        role: 'user',
        active: true,
      });
      await testUser.save();
      console.log('✅ Usuario de prueba creado (username: testuser, password: test123)');
    } else {
      console.log('ℹ️  Usuario de prueba ya existe');
    }
    
    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Usuario: username=testuser, password=test123');
    console.log('\n⚠️  IMPORTANTE: Cambia estas contraseñas en producción!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar seed
seedDatabase();
