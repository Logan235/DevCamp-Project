import React, { useEffect, useState } from "react";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  subText: string;
  subColor?: string;
  progress?: number;
  variant?: "streak" | "xp" | "level" | "solved"; 
}

export default function StatCard({
  icon,
  value,
  label,
  subText,
  subColor = "text-zinc-500",
  progress,
  variant = "streak",
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    const hasNumbers = /[0-9]/.test(value);
    return hasNumbers ? "0" : value;
  });

  useEffect(() => {
    const numericTarget = parseInt(value.replace(/[^0-9]/g, ""), 10);

    if (isNaN(numericTarget)) return;

    // let start = 0;
    const duration = 1200; 
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progressRatio = Math.min(elapsedTime / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progressRatio, 3);
      const currentNumber = Math.floor(easeOutProgress * numericTarget);
      if (value.includes(",")) {
        setDisplayValue(currentNumber.toLocaleString("en-US"));
      } else if (value.startsWith("Lvl. ")) {
        setDisplayValue(`Lvl.  ${currentNumber}`);
      } else {
        setDisplayValue(currentNumber.toString());
      }

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const themeStyles = {
    streak: {
      border: "border-orange-500/30 hover:border-orange-500/60",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]",
      iconColor: "text-orange-500/10 group-hover:text-orange-500/25",
    },
    xp: {
      border: "border-blue-500/30 hover:border-blue-500/60",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
      iconColor: "text-blue-500/10 group-hover:text-blue-500/25",
    },
    level: {
      border: "border-amber-500/30 hover:border-amber-500/60",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
      iconColor: "text-amber-500/10 group-hover:text-amber-500/25",
    },
    solved: {
      border: "border-emerald-500/30 hover:border-emerald-500/60",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
      iconColor: "text-emerald-500/10 group-hover:text-emerald-500/25",
    },
  };

  const currentTheme = themeStyles[variant];

  return (
    <div
      className={`bg-[#111625] border rounded-xl p-5 flex flex-col justify-between h-36 relative overflow-hidden group transition-all duration-300
        ${currentTheme.border} ${currentTheme.glow}
      `}
    >
      <div
        className={`absolute -left-4 -bottom-6 pointer-events-none transition-all duration-500 font-bold scale-[2.8] md:scale-[3.2] origin-bottom-left rotate-12 group-hover:rotate-6 group-hover:scale-[3.4]
          ${currentTheme.iconColor}
        `}
      >
        {icon}
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            {label}
          </span>
          <span className="text-3xl font-black text-white tracking-tight block">
            {displayValue}
          </span>
        </div>

        <div className="mt-2">
          {progress !== undefined ? (
            <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-800/50">
              <div
                className="bg-linear-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <span className={`text-[11px] font-mono tracking-wide ${subColor}`}>
              {subText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
