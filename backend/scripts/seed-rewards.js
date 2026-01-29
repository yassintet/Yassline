const mongoose = require('mongoose');
const Reward = require('../models/Reward');
require('dotenv').config();

const rewards = [
  {
    name: 'Descuento 10€',
    nameEs: 'Descuento 10€',
    nameEn: '10€ Discount',
    nameFr: 'Réduction de 10€',
    description: 'Obtén un descuento fijo de 10€ en tu próxima reserva',
    descriptionEs: 'Obtén un descuento fijo de 10€ en tu próxima reserva',
    descriptionEn: 'Get a fixed 10€ discount on your next booking',
    descriptionFr: 'Obtenez une réduction fixe de 10€ sur votre prochaine réservation',
    pointsRequired: 200,
    type: 'discount',
    discountAmount: 10,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 10%',
    nameEs: 'Descuento 10%',
    nameEn: '10% Discount',
    nameFr: 'Réduction de 10%',
    description: 'Obtén un 10% de descuento en tu próxima reserva',
    descriptionEs: 'Obtén un 10% de descuento en tu próxima reserva',
    descriptionEn: 'Get a 10% discount on your next booking',
    descriptionFr: 'Obtenez une réduction de 10% sur votre prochaine réservation',
    pointsRequired: 500,
    type: 'discount',
    discountPercent: 10,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 15%',
    nameEs: 'Descuento 15%',
    nameEn: '15% Discount',
    nameFr: 'Réduction de 15%',
    description: 'Obtén un 15% de descuento en tu próxima reserva',
    descriptionEs: 'Obtén un 15% de descuento en tu próxima reserva',
    descriptionEn: 'Get a 15% discount on your next booking',
    descriptionFr: 'Obtenez une réduction de 15% sur votre prochaine réservation',
    pointsRequired: 1000,
    type: 'discount',
    discountPercent: 15,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 20%',
    nameEs: 'Descuento 20%',
    nameEn: '20% Discount',
    nameFr: 'Réduction de 20%',
    description: 'Obtén un 20% de descuento en tu próxima reserva',
    descriptionEs: 'Obtén un 20% de descuento en tu próxima reserva',
    descriptionEn: 'Get a 20% discount on your next booking',
    descriptionFr: 'Obtenez une réduction de 20% sur votre prochaine réservation',
    pointsRequired: 2000,
    type: 'discount',
    discountPercent: 20,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Servicio de Aeropuerto Gratis',
    nameEs: 'Servicio de Aeropuerto Gratis',
    nameEn: 'Free Airport Service',
    nameFr: 'Service Aéroport Gratuit',
    description: 'Un servicio de transfer al aeropuerto completamente gratis',
    descriptionEs: 'Un servicio de transfer al aeropuerto completamente gratis',
    descriptionEn: 'A completely free airport transfer service',
    descriptionFr: 'Un service de transfert aéroport complètement gratuit',
    pointsRequired: 3000,
    type: 'service',
    serviceType: 'airport',
    active: true,
  },
  {
    name: 'Upgrade a Vehículo Premium',
    nameEs: 'Upgrade a Vehículo Premium',
    nameEn: 'Upgrade to Premium Vehicle',
    nameFr: 'Mise à Niveau vers Véhicule Premium',
    description: 'Mejora tu reserva a un vehículo de categoría superior sin costo adicional',
    descriptionEs: 'Mejora tu reserva a un vehículo de categoría superior sin costo adicional',
    descriptionEn: 'Upgrade your booking to a higher category vehicle at no additional cost',
    descriptionFr: 'Améliorez votre réservation vers un véhicule de catégorie supérieure sans frais supplémentaires',
    pointsRequired: 2500,
    type: 'upgrade',
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 50€',
    nameEs: 'Descuento 50€',
    nameEn: '50€ Discount',
    nameFr: 'Réduction de 50€',
    description: 'Obtén un descuento fijo de 50€ en tu próxima reserva',
    descriptionEs: 'Obtén un descuento fijo de 50€ en tu próxima reserva',
    descriptionEn: 'Get a fixed 50€ discount on your next booking',
    descriptionFr: 'Obtenez une réduction fixe de 50€ sur votre prochaine réservation',
    pointsRequired: 5000,
    type: 'discount',
    discountAmount: 50,
    serviceType: 'any',
    active: true,
  },
];

async function seedRewards() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yasslinetour');
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Eliminando recompensas existentes...');
    await Reward.deleteMany({});
    console.log('✅ Recompensas eliminadas');

    console.log('📦 Insertando recompensas...');
    const insertedRewards = await Reward.insertMany(rewards);
    console.log(`✅ ${insertedRewards.length} recompensas insertadas`);

    console.log('\n📋 Recompensas creadas:');
    insertedRewards.forEach((reward, index) => {
      console.log(`${index + 1}. ${reward.nameEs} - ${reward.pointsRequired} puntos`);
    });

    console.log('\n✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedRewards();
