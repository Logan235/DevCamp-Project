import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "info" | "error";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  const variants = {
    // strength
    success:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 active-glow-green",

    // improvement
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",

    // hint
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",

    // error
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm tracking-wide ${variants[variant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === "success"
            ? "bg-emerald-400"
            : variant === "warning"
              ? "bg-amber-400"
              : variant === "error"
                ? "bg-rose-400"
                : "bg-sky-400"
        }`}
      />
      {children}
    </span>
  );
};
