import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message: string;
  showBackButton?: boolean;
  backUrl?: string;
  backLabel?: string;
  fullScreen?: boolean;
}

export default function ErrorState({
  title = "Error",
  message,
  showBackButton = false,
  backUrl = "/",
  backLabel = "Volver",
  fullScreen = false,
}: ErrorStateProps) {
  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-[calc(100vh-200px)]"
    : "py-12";

  return (
    <div className={containerClass}>
      <div className={`max-w-md mx-auto px-4 text-center ${!fullScreen ? "bg-red-50 border border-red-200 rounded-xl p-6" : ""}`}>
        <AlertCircle className={`h-16 w-16 text-red-500 mx-auto mb-4 ${fullScreen ? "" : "hidden"}`} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {showBackButton && (
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 bg-[var(--yass-gold)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
