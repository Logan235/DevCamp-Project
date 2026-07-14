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
    <div className="group bg-white dark:bg-[#0d1527] p-6 gap-3 flex flex-col rounded-2xl border border-gray-200 dark:border-slate-800/60 hover:border-blue-500 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-xs">
      <div className="items-center flex justify-center rounded-2xl w-12 h-12 bg-blue-50 dark:bg-[#0c1a30] text-blue-600 dark:text-[#50a2ff] border border-blue-100 dark:border-cyan-500/5">
        {icon}
      </div>
      <span className="font-semibold text-gray-950 dark:text-white transition-colors">
        {title}
      </span>
      <span className="text-[14px] text-gray-500 dark:text-slate-400 transition-colors">
        {description}
      </span>
    </div>
  );
};
