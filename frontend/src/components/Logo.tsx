import Link from "next/link";
import { MapPin } from "lucide-react";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  href = "/",
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "w-8 h-8",
      iconInner: "w-4 h-4",
      text: "text-xl",
      img: "w-8 h-8",
    },
    md: {
      icon: "w-10 h-10 md:w-12 md:h-12",
      iconInner: "w-6 h-6 md:w-7 md:h-7",
      text: "text-2xl md:text-3xl",
      img: "w-10 h-10 md:w-12 md:h-12",
    },
    lg: {
      icon: "w-14 h-14 md:w-16 md:h-16",
      iconInner: "w-8 h-8 md:w-10 md:h-10",
      text: "text-4xl md:text-5xl",
      img: "w-14 h-14 md:w-16 md:h-16",
    },
  };

  const classes = sizeClasses[size];

  const logoContent = (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div className="relative flex-shrink-0">
        {/* Imagen del logo si existe, si no icono elegante negro/dorado */}
        <div
          className={`${classes.icon} rounded-xl bg-[var(--yass-black)] flex items-center justify-center overflow-hidden border border-yass-gold/30 group-hover:border-yass-gold/60 transition-all duration-300 shadow-lg`}
        >
          <MapPin
            className={`${classes.iconInner} text-[var(--yass-gold)] drop-shadow-sm relative z-10`}
            strokeWidth={2}
          />
        </div>
      </div>

      {showText && (
        <div className="relative">
          <h1
            className={`${classes.text} font-bold text-[var(--yass-black)] group-hover:text-[var(--yass-gold)] transition-colors duration-300 cursor-pointer tracking-tight`}
          >
            <span>Yassline</span>
            <span className="font-light text-[var(--yass-muted)] group-hover:text-[var(--yass-gold-pale)]">
              {" "}
              Tour
            </span>
          </h1>
          <div className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--yass-gold)] group-hover:w-full transition-all duration-300 rounded-full" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={false} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
