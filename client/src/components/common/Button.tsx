import React, { type ButtonHTMLAttributes } from "react";
import { Link } from "react-router";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "oauth" | "normal" | "thirdary";
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
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    // nút chính
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 shadow-md shadow-emerald-900/20 cursor-pointer hover:scale-105",

    // nút phụ
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 focus:ring-zinc-600 cursor-pointer",

    // run code
    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold focus:ring-emerald-500 cursor-pointer",

    // nút đăng nhập bằng phương thức khác
    oauth:
      "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-700/80 w-full justify-center gap-2",

    // nút không nền
    normal: "cursor-pointer hover:scale-105",

    // nút vàng
    thirdary:
      "bg-amber-600 hover:bg-amber-500 text-black focus:ring-amber-500 shadow-md shadow-amber-900/20 cursor-pointer hover:scale-105",
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
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
