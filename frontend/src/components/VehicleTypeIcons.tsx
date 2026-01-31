"use client";

import React, { useState } from "react";
import { Car, Van, Bus, LayoutGrid } from "lucide-react";

type IconProps = { className?: string; size?: number; strokeWidth?: number };

const sizePx = 32;
const iconStyle = { width: sizePx, height: sizePx, minWidth: sizePx, minHeight: sizePx, flexShrink: 0 };

/** Iconos subidos en public/img (van = vito, sprinter, sedan = clase s) */
const IMG = {
  van: "/img/icon vito.png",
  sprinter: "/img/icon sprinter.png",
  sedan: "/img/icon clase s.png",
};

function IconImg({
  src,
  alt,
  className,
  Fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  Fallback: React.ComponentType<IconProps>;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Fallback className={className} />;
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", ...iconStyle }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}

/**
 * Van / Minivan (V-Class, Vito) — usa tu icono en public/img/icon vito.png
 */
export function VehicleIconVan({ className }: IconProps) {
  return (
    <IconImg
      src={IMG.van}
      alt="Van"
      className={className}
      Fallback={() => <Van className={className} size={sizePx} strokeWidth={2} style={iconStyle} />}
    />
  );
}

/**
 * Minibús (Sprinter) — usa tu icono en public/img/icon sprinter.png
 */
export function VehicleIconMinibus({ className }: IconProps) {
  return (
    <IconImg
      src={IMG.sprinter}
      alt="Sprinter"
      className={className}
      Fallback={() => <Bus className={className} size={sizePx} strokeWidth={2} style={iconStyle} />}
    />
  );
}

export function VehicleIconBus({ className }: IconProps) {
  return <Bus className={className} size={sizePx} strokeWidth={2} style={iconStyle} />;
}

/**
 * Sedán / Otros — usa tu icono en public/img/icon clase s.png
 */
export function VehicleIconSedan({ className }: IconProps) {
  return (
    <IconImg
      src={IMG.sedan}
      alt="Sedán"
      className={className}
      Fallback={() => <Car className={className} size={sizePx} strokeWidth={2} style={iconStyle} />}
    />
  );
}

export function VehicleIconAll({ className }: IconProps) {
  return <LayoutGrid className={className} size={sizePx} strokeWidth={2} style={iconStyle} />;
}

export type VehicleTypeIconComponent = React.ComponentType<IconProps>;

const vehicleTypeIconMap: Record<string, VehicleTypeIconComponent> = {
  "v-class": VehicleIconVan,
  vito: VehicleIconVan,
  sprinter: VehicleIconMinibus,
  other: VehicleIconSedan,
};

export function getVehicleTypeIcon(type: string): VehicleTypeIconComponent {
  return vehicleTypeIconMap[type] ?? VehicleIconAll;
}
