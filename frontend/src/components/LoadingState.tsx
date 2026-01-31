import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ 
  message = "Cargando...", 
  fullScreen = false 
}: LoadingStateProps) {
  const containerClass = fullScreen 
    ? "flex items-center justify-center min-h-[calc(100vh-200px)]"
    : "flex items-center justify-center py-20";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--yass-gold)] mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
