// Traducciones para datos de vehículos que vienen de la BD

export const vehicleTranslations: Record<string, {
  es: {
    name: string;
    description: string;
    features: string[];
    luggage: string;
  };
  en: {
    name: string;
    description: string;
    features: string[];
    luggage: string;
  };
  fr: {
    name: string;
    description: string;
    features: string[];
    luggage: string;
  };
}> = {
  'v-class': {
    es: {
      name: 'Mercedes V-Class',
      description: 'Vehículo de lujo con todas las comodidades. Ideal para grupos pequeños que buscan máximo confort.',
      features: [
        'WiFi gratuito',
        'Aire acondicionado',
        'Asientos de cuero',
        'Pantallas de entretenimiento',
        'Cargadores USB'
      ],
      luggage: '5 maletas grandes'
    },
    en: {
      name: 'Mercedes V-Class',
      description: 'Luxury vehicle with all amenities. Ideal for small groups seeking maximum comfort.',
      features: [
        'Free WiFi',
        'Air conditioning',
        'Leather seats',
        'Entertainment screens',
        'USB chargers'
      ],
      luggage: '5 large suitcases'
    },
    fr: {
      name: 'Mercedes V-Class',
      description: 'Véhicule de luxe avec tout le confort. Idéal pour les petits groupes recherchant un confort maximum.',
      features: [
        'WiFi gratuit',
        'Climatisation',
        'Sièges en cuir',
        'Écrans de divertissement',
        'Chargeurs USB'
      ],
      luggage: '5 grandes valises'
    }
  },
  'vito': {
    es: {
      name: 'Mercedes Vito',
      description: 'Vehículo espacioso y confortable, perfecto para familias o grupos medianos.',
      features: [
        'WiFi gratuito',
        'Aire acondicionado',
        'Asientos reclinables',
        'Cargadores USB'
      ],
      luggage: '8 maletas grandes'
    },
    en: {
      name: 'Mercedes Vito',
      description: 'Spacious and comfortable vehicle, perfect for families or medium-sized groups.',
      features: [
        'Free WiFi',
        'Air conditioning',
        'Reclining seats',
        'USB chargers'
      ],
      luggage: '8 large suitcases'
    },
    fr: {
      name: 'Mercedes Vito',
      description: 'Véhicule spacieux et confortable, parfait pour les familles ou les groupes moyens.',
      features: [
        'WiFi gratuit',
        'Climatisation',
        'Sièges inclinables',
        'Chargeurs USB'
      ],
      luggage: '8 grandes valises'
    }
  },
  'sprinter': {
    es: {
      name: 'Mercedes Sprinter',
      description: 'Vehículo de gran capacidad para grupos grandes. Equipado con todas las comodidades modernas.',
      features: [
        'WiFi gratuito',
        'Aire acondicionado',
        'Asientos cómodos',
        'Espacio amplio para equipaje',
        'Sistema de sonido'
      ],
      luggage: '15 maletas grandes'
    },
    en: {
      name: 'Mercedes Sprinter',
      description: 'High-capacity vehicle for large groups. Equipped with all modern amenities.',
      features: [
        'Free WiFi',
        'Air conditioning',
        'Comfortable seats',
        'Spacious luggage area',
        'Sound system'
      ],
      luggage: '15 large suitcases'
    },
    fr: {
      name: 'Mercedes Sprinter',
      description: 'Véhicule de grande capacité pour les grands groupes. Équipé de toutes les commodités modernes.',
      features: [
        'WiFi gratuit',
        'Climatisation',
        'Sièges confortables',
        'Grand espace pour bagages',
        'Système audio'
      ],
      luggage: '15 grandes valises'
    }
  }
};

export function translateVehicle(vehicle: any, language: 'es' | 'en' | 'fr') {
  // Verificar que el vehículo tenga un tipo válido
  if (!vehicle || !vehicle.type) {
    console.warn('⚠️ Vehicle missing type:', vehicle);
    return vehicle;
  }

  const translation = vehicleTranslations[vehicle.type];
  if (!translation) {
    // Si no hay traducción, devolver datos originales
    console.warn(`⚠️ No translation found for vehicle type: ${vehicle.type}`);
    return vehicle;
  }

  const translated = {
    ...vehicle,
    name: translation[language].name,
    description: translation[language].description,
    features: translation[language].features,
    capacity: {
      ...vehicle.capacity,
      luggage: translation[language].luggage
    }
  };

  return translated;
}
