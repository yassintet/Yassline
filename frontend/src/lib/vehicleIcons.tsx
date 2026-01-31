"use client";

import { getVehicleTypeIcon } from "@/components/VehicleTypeIcons";

/**
 * Iconos por tipo de vehículo — realistas en negro (estilo captura):
 * - v-class: Van / Minivan (V-Class es una van, no sedán)
 * - vito: Van
 * - sprinter: Minibús
 * - other: Sedán (para futuros vehículos sedán)
 */
export { getVehicleTypeIcon as getVehicleIcon };
export type { VehicleTypeIconComponent } from "@/components/VehicleTypeIcons";
