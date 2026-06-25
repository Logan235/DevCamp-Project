type ProgressBarProps = {
  answeredCount: number;
  totalquest: number;
};

export default function ProgressBar({
  answeredCount,
  totalquest,
}: ProgressBarProps) {
  const percentage =
    totalquest > 0 ? Math.min((answeredCount / totalquest) * 100, 100) : 0;
return (
  <div className="w-full flex items-center gap-4">
    <span className="text-sm text-slate-400 whitespace-nowrap">
      Tiến độ
    </span>

    <div className="flex-1 h-2 bg-[#111827] rounded-full overflow-hidden">
      <div
        className="
        h-full
        rounded-full
        bg-gradient-to-r
        from-[#22c55e]
        to-[#4ade80]
        transition-all
        duration-500
        "
        style={{ width: `${percentage}%` }}
      />
    </div>

    <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap">
      {answeredCount}/{totalquest}
    </span>
  </div>
);
}
