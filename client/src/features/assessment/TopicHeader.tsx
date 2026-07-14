import type React from "react";

interface TopicHeaderProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border)",
      }}
      className="group p-6 gap-3 flex flex-col rounded-2xl border hover:border-blue-500/50! cursor-pointer transition-all shadow-xs"
    >
      <div
        style={{ borderColor: "var(--border)" }}
        className="items-center flex justify-center rounded-2xl w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-[#50a2ff] border"
      >
        {icon}
      </div>
      <span
        style={{ color: "var(--text)" }}
        className="font-semibold transition-colors"
      >
        {title}
      </span>
      <span
        style={{ color: "var(--text-h)" }}
        className="text-[14px] transition-colors"
      >
        {description}
      </span>
    </div>
  );
};
