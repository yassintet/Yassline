require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Circuit = require('../models/Circuit');

// Circuitos del Norte de Marruecos
const newCircuits = [
  {
    name: 'Circuito Norte 4 Días',
    title: 'Descubre el Norte de Marruecos en 4 días',
    description: `Un viaje fascinante por el norte de Marruecos, descubriendo las ciudades más emblemáticas de la región. Desde Tánger, la puerta de entrada a África, hasta las montañas de Chefchaouen, la ciudad azul, pasando por Tetuán y sus playas mediterráneas. Un circuito perfecto para conocer la esencia del norte marroquí en pocos días.

Este circuito te llevará por paisajes montañosos, ciudades históricas y costas mediterráneas, combinando cultura, naturaleza y relax. Ideal para aquellos que buscan una experiencia completa pero en un tiempo limitado.`,
    duration: '4 Días / 3 Noches',
    price: 420,
    priceLabel: 'Desde 420€ / persona',
    image: '/img/Marrakech-cityf.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Tánger',
        description: 'Recepción en el puerto o aeropuerto de Tánger. Traslado al hotel. Tarde libre para explorar la ciudad, visitar la Kasbah, el Gran Zoco y disfrutar de las vistas del Estrecho de Gibraltar desde el Cap Spartel.',
      },
      {
        day: 2,
        title: 'Tánger - Tetuán - Chefchaouen',
        description: 'Salida hacia Tetuán, ciudad declarada Patrimonio de la Humanidad por la UNESCO. Visita de la medina y continuación hacia Chefchaouen, la famosa ciudad azul. Llegada y alojamiento. Tarde libre para explorar las calles azules de Chefchaouen.',
      },
      {
        day: 3,
        title: 'Chefchaouen - Akchour - Chefchaouen',
        description: 'Día completo en Chefchaouen. Opcional: excursión a las cascadas de Akchour en las montañas del Rif. Regreso a Chefchaouen para disfrutar de la ciudad y sus tiendas de artesanía.',
      },
      {
        day: 4,
        title: 'Chefchaouen - Tánger',
        description: 'Mañana libre en Chefchaouen. Regreso a Tánger por la tarde. Traslado al puerto o aeropuerto. Fin del circuito.',
      },
    ],
    includes: [
      'Chofer privado profesional',
      'Vehículo Mercedes-Benz con aire acondicionado',
      'Combustible y peajes',
      'Alojamiento en hoteles 3-4 estrellas',
      'Desayunos incluidos',
      'Guía local en Chefchaouen',
      'Seguro de viaje',
    ],
    featured: true,
    active: true,
  },
  {
    name: 'Circuito Norte 6 Días',
    title: 'Exploración completa del Norte de Marruecos',
    description: `Un circuito completo de 6 días que te permitirá descubrir en profundidad el norte de Marruecos. Desde las costas mediterráneas hasta las montañas del Rif, pasando por ciudades históricas, pueblos tradicionales y paisajes espectaculares.

Este circuito incluye visitas a Tánger, Tetuán, Chefchaouen, Asilah y otras joyas del norte, con tiempo suficiente para disfrutar de cada lugar, probar la gastronomía local y sumergirte en la cultura marroquí.`,
    duration: '6 Días / 5 Noches',
    price: 680,
    priceLabel: 'Desde 680€ / persona',
    image: '/img/Marrakech-cityf.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Tánger',
        description: 'Recepción en el puerto o aeropuerto de Tánger. Traslado al hotel. Visita guiada de Tánger: Kasbah, Gran Zoco, Cap Spartel y las Cuevas de Hércules. Cena en un restaurante tradicional.',
      },
      {
        day: 2,
        title: 'Tánger - Asilah - Larache - Rabat',
        description: 'Salida hacia Asilah, ciudad costera con murallas portuguesas. Continuación hacia Larache y luego a Rabat, capital de Marruecos. Visita de la Kasbah de los Oudaias y la Torre Hassan. Alojamiento en Rabat.',
      },
      {
        day: 3,
        title: 'Rabat - Meknes - Fez',
        description: 'Salida hacia Meknes, ciudad imperial. Visita de la Plaza El Hedim, la Puerta Bab Mansour y las Caballerizas Reales. Continuación hacia Fez. Llegada y alojamiento.',
      },
      {
        day: 4,
        title: 'Fez - Chefchaouen',
        description: 'Visita guiada de Fez: medina, madrasas, barrio de los curtidores. Por la tarde, salida hacia Chefchaouen, la ciudad azul. Llegada y alojamiento.',
      },
      {
        day: 5,
        title: 'Chefchaouen - Tetuán - Tánger',
        description: 'Mañana libre en Chefchaouen para explorar sus calles azules y comprar artesanía. Por la tarde, salida hacia Tetuán para visitar su medina declarada Patrimonio de la Humanidad. Continuación hacia Tánger. Alojamiento.',
      },
      {
        day: 6,
        title: 'Tánger - Salida',
        description: 'Mañana libre en Tánger. Traslado al puerto o aeropuerto. Fin del circuito.',
      },
    ],
    includes: [
      'Chofer privado profesional',
      'Vehículo Mercedes-Benz de lujo',
      'Combustible, peajes y parking',
      'Alojamiento en hoteles 4 estrellas',
      'Desayunos incluidos',
      'Guías locales en Fez y Chefchaouen',
      'Visitas guiadas en todas las ciudades',
      'Seguro de viaje',
      'WiFi gratuito en el vehículo',
    ],
    featured: true,
    active: true,
  },
  {
    name: 'Circuito Completo 12 Días',
    title: 'Gran Tour de Marruecos - 12 días',
    description: `El circuito más completo para descubrir Marruecos en toda su extensión. Este viaje de 12 días te llevará desde el norte hasta el sur, pasando por las ciudades imperiales, el desierto del Sahara, las montañas del Atlas y la costa atlántica.

Un recorrido que combina historia, cultura, naturaleza y aventura, visitando los lugares más emblemáticos del país: Tánger, Chefchaouen, Fez, Meknes, Rabat, Casablanca, Marrakech, Ouarzazate, el Valle del Dades, Merzouga y más. La experiencia definitiva de Marruecos.`,
    duration: '12 Días / 11 Noches',
    price: 1250,
    priceLabel: 'Desde 1250€ / persona',
    image: '/img/Marrakech-cityf.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Tánger',
        description: 'Recepción en el puerto o aeropuerto de Tánger. Traslado al hotel. Visita guiada de Tánger: Kasbah, Gran Zoco, Cap Spartel y las Cuevas de Hércules. Alojamiento.',
      },
      {
        day: 2,
        title: 'Tánger - Chefchaouen',
        description: 'Salida hacia Chefchaouen, la famosa ciudad azul en las montañas del Rif. Llegada y alojamiento. Tarde libre para explorar las calles azules y disfrutar del ambiente único de esta ciudad.',
      },
      {
        day: 3,
        title: 'Chefchaouen - Fez',
        description: 'Mañana libre en Chefchaouen. Por la tarde, salida hacia Fez atravesando paisajes montañosos. Llegada a Fez, la capital cultural y espiritual de Marruecos. Alojamiento.',
      },
      {
        day: 4,
        title: 'Visita completa de Fez',
        description: 'Día completo dedicado a la visita de Fez: medina (la más grande del mundo), madrasas, barrio de los curtidores, barrio judío (Mellah), y los palacios reales. Almuerzo en un restaurante tradicional. Alojamiento.',
      },
      {
        day: 5,
        title: 'Fez - Meknes - Rabat - Casablanca',
        description: 'Salida hacia Meknes, ciudad imperial. Visita de la Plaza El Hedim y la Puerta Bab Mansour. Continuación hacia Rabat, capital de Marruecos. Visita rápida y continuación hacia Casablanca. Alojamiento.',
      },
      {
        day: 6,
        title: 'Casablanca - Marrakech',
        description: 'Visita de Casablanca: mezquita de Hassan II (exterior), paseo marítimo de La Corniche. Salida hacia Marrakech atravesando paisajes agrícolas. Llegada y alojamiento.',
      },
      {
        day: 7,
        title: 'Visita de Marrakech',
        description: 'Día completo en Marrakech: plaza Jemaa el-Fnaa, palacio de la Bahía, tumbas Saadíes, jardines de la Menara y Majorelle. Tarde libre para explorar los zocos. Alojamiento.',
      },
      {
        day: 8,
        title: 'Marrakech - Ouarzazate',
        description: 'Salida hacia Ouarzazate atravesando el Alto Atlas por el puerto de Tizi n\'Tichka (2260m). Visita de la Kasbah de Ait Ben Haddou, declarada Patrimonio de la Humanidad. Llegada a Ouarzazate. Alojamiento.',
      },
      {
        day: 9,
        title: 'Ouarzazate - Valle del Dades - Merzouga',
        description: 'Salida hacia el Valle del Dades pasando por el Valle de las Rosas y las Gargantas del Todra. Continuación hacia Merzouga, puerta del desierto del Sahara. Paseo en camello al atardecer. Noche en campamento bereber.',
      },
      {
        day: 10,
        title: 'Merzouga - Ouarzazate',
        description: 'Amanecer en las dunas del Sahara. Desayuno en el campamento. Regreso a Ouarzazate atravesando paisajes desérticos y montañosos. Alojamiento.',
      },
      {
        day: 11,
        title: 'Ouarzazate - Marrakech',
        description: 'Regreso a Marrakech por la misma ruta del Alto Atlas. Llegada y tarde libre. Última noche en Marrakech para disfrutar de la ciudad y hacer compras.',
      },
      {
        day: 12,
        title: 'Marrakech - Salida',
        description: 'Traslado al aeropuerto de Marrakech según horario de vuelo. Fin del circuito.',
      },
    ],
    includes: [
      'Chofer privado profesional durante todo el circuito',
      'Vehículo Mercedes-Benz de lujo (Vito, V-Class o Sprinter)',
      'Combustible, peajes y parking',
      'Alojamiento en hoteles 4-5 estrellas',
      'Desayunos incluidos',
      'Noche en campamento bereber en el desierto',
      'Paseo en camello en Merzouga',
      'Guías locales en Fez y Marrakech',
      'Visitas guiadas en todas las ciudades principales',
      'Seguro de viaje completo',
      'WiFi gratuito en el vehículo',
      'Agua mineral durante el viaje',
    ],
    featured: true,
    active: true,
  },
];

async function addCircuits() {
  try {
    // Conectar a MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI no está configurado en .env');
      process.exit(1);
    }

    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB');

    // Verificar si los circuitos ya existen
    for (const circuitData of newCircuits) {
      const existing = await Circuit.findOne({ name: circuitData.name });
      if (existing) {
        console.log(`⚠️  El circuito "${circuitData.name}" ya existe. Actualizando...`);
        await Circuit.findOneAndUpdate(
          { name: circuitData.name },
          circuitData,
          { new: true, upsert: false }
        );
        console.log(`✅ Circuito "${circuitData.name}" actualizado`);
      } else {
        const circuit = new Circuit(circuitData);
        await circuit.save();
        console.log(`✅ Circuito "${circuitData.name}" creado exitosamente`);
      }
    }

    console.log('\n✅ Todos los circuitos han sido añadidos/actualizados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCircuits();
