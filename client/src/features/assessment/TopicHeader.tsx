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
    <div className="group bg-(--bg) p-6 gap-3 flex flex-col rounded-2xl hover:border border-(--border) cursor-pointer">
      <div className="items-center flex justify-center rounded-2xl w-12 h-12 bg-[#0c1a30] text-[#50a2ff] border border-cyan-500/5">
        {icon}
      </div>
      <span className="font-semibold text-white">{title} </span>
      <span className="text-[14px]">{description}</span>
    </div>
  );
};
