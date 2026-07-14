import React, { type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "oauth"
    | "normal"
    | "thirdary";
  size?: "sm" | "md" | "lg" | "xlg";
  children: React.ReactNode;
  to?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  to,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white !text-white focus:ring-emerald-500 shadow-md shadow-emerald-900/20 cursor-pointer hover:scale-105",

    secondary:
      "bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700 focus:ring-gray-500 dark:focus:ring-zinc-600 cursor-pointer",

    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white !text-white font-semibold focus:ring-emerald-500 cursor-pointer",

    oauth:
      "bg-gray-100 dark:bg-zinc-800/60 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/80 w-full justify-center gap-2",

    normal: "cursor-pointer hover:scale-105 text-current",

    thirdary:
      "bg-amber-600 hover:bg-amber-500 text-white !text-white focus:ring-amber-500 shadow-md shadow-amber-900/20 cursor-pointer hover:scale-105",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xlg: "px-6 py-3 text-base",
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {children}
      </Link>
    );
  }
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
