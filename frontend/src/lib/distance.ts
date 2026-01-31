const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface DistanceResult {
  distance: number;
  price: number;
  origin?: string;
  destination?: string;
  method?: string;
}

/**
 * Calcula la distancia en kilómetros entre dos direcciones usando el endpoint del backend
 * @param origin Dirección de origen
 * @param destination Dirección de destino
 * @param vehicleType Tipo de vehículo (opcional): 'vito', 'v-class', 'sprinter'
 * @param passengers Número de pasajeros (opcional)
 * @returns Objeto con distancia y precio, o null si hay error
 */
export async function calculateDistance(
  origin: string,
  destination: string,
  vehicleType?: string,
  passengers?: number
): Promise<DistanceResult | null> {
  if (!origin || !destination) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/distance/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        destination,
        vehicleType,
        passengers: passengers ? parseInt(passengers.toString()) : undefined,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch (e) {
        errorData = { error: 'Error desconocido del servidor' };
      }
      console.error('Error en la respuesta del servidor:', response.status);
      console.error('Detalles del error:', errorData);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data?.distance) {
      return {
        distance: data.data.distance,
        price: data.data.price || data.data.distance * 1.5,
        origin: data.data.origin,
        destination: data.data.destination,
        method: data.data.method,
      };
    }

    console.error('Error calculando distancia:', data.error || data);
    return null;
  } catch (error) {
    console.error("Error calculando distancia:", error);
    return null;
  }
}

/**
 * Calcula el precio para servicio inter-ciudades según tipo de vehículo
 * @param distance Distancia en kilómetros
 * @param vehicleType Tipo de vehículo: 'vito', 'v-class', 'sprinter'
 * @param passengers Número de pasajeros
 * @returns Precio calculado
 */
export function calculateIntercityPrice(
  distance: number,
  vehicleType?: string,
  passengers?: number
): number {
  if (!distance || distance <= 0) {
    return 0;
  }

  // Tarifas por tipo de vehículo (fallback - el cálculo real se hace en el backend)
  const rates: Record<string, { ratePerKm: number; maxCapacity: number; returnTripSupplement: number }> = {
    'vito': { ratePerKm: 7, maxCapacity: 7, returnTripSupplement: 0.4 },
    'v-class': { ratePerKm: 9, maxCapacity: 6, returnTripSupplement: 0.4 },
    'sprinter': { ratePerKm: 9, maxCapacity: 18, returnTripSupplement: 0.4 },
  };

  if (vehicleType && rates[vehicleType]) {
    const config = rates[vehicleType];
    let price = distance * config.ratePerKm;
    
    // Aplicar suplemento obligatorio del 40% para trayecto de vuelta (siempre aplicado)
    price = price * (1 + config.returnTripSupplement);
    
    // Aplicar descuento del 35% si distancia > 220 km y pasajeros < 5
    if (distance > 220 && passengers && passengers < 5) {
      price = price * 0.65; // Descuento del 35% (multiplicar por 0.65)
    }
    
    return Math.round(price * 100) / 100;
  }

  // Precio por defecto (1.5 MAD/km)
  return Math.round(distance * 1.5 * 100) / 100;
}
