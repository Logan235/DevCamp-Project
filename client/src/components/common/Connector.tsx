import React from "react";

interface ConnectorProps {
  status: "completed" | "current" | "locked";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const Connector: React.FC<ConnectorProps> = ({
  status,
  x1,
  y1,
  x2,
  y2,
}) => {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        className="transition-all duration-300"
        stroke={isCompleted ? "#10b981" : isLocked ? "#27272a" : "#0ea5e9"}
        strokeWidth={isLocked ? "2" : "3"}
        strokeDasharray={status === "current" ? "4 4" : "0"}
        strokeOpacity={isLocked ? "0.4" : "0.8"}
      />
    </svg>
  );
};
