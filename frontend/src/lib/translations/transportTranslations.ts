// Traducciones para datos de servicios de transporte que vienen de la BD

export const transportTranslations: Record<string, {
  es: {
    name: string;
    description: string;
  };
  en: {
    name: string;
    description: string;
  };
  fr: {
    name: string;
    description: string;
  };
}> = {
  'airport': {
    es: {
      name: 'Traslado Aeropuerto',
      description: 'Servicio de traslado desde/hacia el aeropuerto. Precio fijo de 40€ para traslados a la ciudad del aeropuerto. Para otras ciudades, se aplican tarifas inter-ciudades + 5€ de suplemento. Disponible 24/7 con vehículos cómodos y seguros.'
    },
    en: {
      name: 'Airport Transfer',
      description: 'Transfer service to/from the airport. Fixed price of 40€ for transfers to the airport city. For other cities, inter-city rates + 5€ supplement apply. Available 24/7 with comfortable and safe vehicles.'
    },
    fr: {
      name: 'Transfert Aéroport',
      description: 'Service de transfert vers/depuis l\'aéroport. Prix fixe de 40€ pour les transferts vers la ville de l\'aéroport. Pour les autres villes, tarifs inter-villes + supplément de 5€. Disponible 24/7 avec des véhicules confortables et sûrs.'
    }
  },
  'intercity': {
    es: {
      name: 'Traslado Interciudades',
      description: 'Conecta las principales ciudades de Marruecos con comodidad y seguridad. Ideal para viajes de negocios o turismo.'
    },
    en: {
      name: 'Intercity Transfer',
      description: 'Connect the main cities of Morocco with comfort and safety. Ideal for business or tourism trips.'
    },
    fr: {
      name: 'Transfert Inter-Villes',
      description: 'Connectez les principales villes du Maroc avec confort et sécurité. Idéal pour les voyages d\'affaires ou le tourisme.'
    }
  },
  'hourly': {
    es: {
      name: 'Servicio por Horas',
      description: 'Alquila un vehículo con chofer por horas. Perfecto para tours personalizados, compras o eventos. El servicio incluye chofer profesional, vehículo de lujo Mercedes-Benz, seguro de viaje y todos los servicios premium. Los precios varían según el tipo de vehículo y las horas contratadas. Se aplican suplementos para servicios cortos: +30% para 1-2 horas y +20% para 3-4 horas. A partir de 5 horas, el precio es sin suplementos adicionales.'
    },
    en: {
      name: 'Hourly Service',
      description: 'Rent a vehicle with driver by the hour. Perfect for custom tours, shopping or events. The service includes professional driver, luxury Mercedes-Benz vehicle, travel insurance and all premium services. Prices vary according to vehicle type and hours contracted. Supplements apply for short services: +30% for 1-2 hours and +20% for 3-4 hours. From 5 hours onwards, the price is without additional supplements.'
    },
    fr: {
      name: 'Service à l\'Heure',
      description: 'Louez un véhicule avec chauffeur à l\'heure. Parfait pour les visites personnalisées, les achats ou les événements. Le service comprend chauffeur professionnel, véhicule de luxe Mercedes-Benz, assurance voyage et tous les services premium. Les prix varient selon le type de véhicule et les heures contractées. Des suppléments s\'appliquent pour les services courts : +30% pour 1-2 heures et +20% pour 3-4 heures. À partir de 5 heures, le prix est sans suppléments supplémentaires.'
    }
  },
  'custom': {
    es: {
      name: 'Servicio Personalizado',
      description: 'Crea tu propio itinerario. Te ayudamos a diseñar el viaje perfecto según tus necesidades.'
    },
    en: {
      name: 'Custom Service',
      description: 'Create your own itinerary. We help you design the perfect trip according to your needs.'
    },
    fr: {
      name: 'Service Personnalisé',
      description: 'Créez votre propre itinéraire. Nous vous aidons à concevoir le voyage parfait selon vos besoins.'
    }
  }
};

export function translateTransport(transport: any, language: 'es' | 'en' | 'fr') {
  const translation = transportTranslations[transport.type];
  if (!translation) {
    // Si no hay traducción, devolver datos originales
    return transport;
  }

  return {
    ...transport,
    name: translation[language].name,
    description: translation[language].description
  };
}
