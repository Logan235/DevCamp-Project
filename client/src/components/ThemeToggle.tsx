import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg
        transition-all duration-300 ease-in-out
        text-gray-800 dark:text-gray-100
        focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900 cursor-pointer
        ${className}
      `}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};
