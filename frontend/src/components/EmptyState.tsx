import { Car, MapPin, Route, AlertCircle, Calendar, FileText, Gift } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon?: "car" | "map" | "route" | "alert" | "calendar" | "fileText" | "gift";
  title?: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  showAction?: boolean;
  children?: React.ReactNode;
}

const iconMap = {
  car: Car,
  map: MapPin,
  route: Route,
  alert: AlertCircle,
  calendar: Calendar,
  fileText: FileText,
  gift: Gift,
};

export default function EmptyState({
  icon = "alert",
  title,
  message,
  actionLabel,
  actionUrl,
  showAction = false,
  children,
}: EmptyStateProps & { children?: React.ReactNode }) {
  const IconComponent = iconMap[icon];

  return (
    <div className="text-center py-20">
      <IconComponent className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      {title && <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>}
      <p className="text-gray-600 text-lg mb-6">{message}</p>
      {children}
      {showAction && actionUrl && actionLabel && !children && (
        <Link
          href={actionUrl}
          className="inline-flex items-center gap-2 text-[var(--yass-gold)] hover:text-[var(--yass-gold-light)] font-semibold transition-colors"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
