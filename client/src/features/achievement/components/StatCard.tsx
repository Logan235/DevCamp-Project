import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
<div
  className="
relative
overflow-hidden
rounded-3xl
border border-[#2F4672]
bg-[#1A2234]
p-6
transition-all
duration-300
shadow-[0_12px_30px_rgba(0,0,0,.35)]
hover:border-[#4B6FB8]
hover:shadow-[0_0_40px_rgba(59,130,246,.18)]
"
>
      <div
        className="
        w-14
        h-14
        rounded-2xl
        flex
        items-center
        justify-center
        bg-[#0d1324]
        border border-[#23304d]
        mb-5
      "
      >
        <Icon className={`w-7 h-7 ${color}`} />
      </div>

      <h2 className="text-4xl font-bold text-white">{value}</h2>

      <p className="mt-2 text-slate-400">{title}</p>
    </div>
  );
}