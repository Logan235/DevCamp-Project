const days = [
  0, 1, 1, 1, 0, 1, 1,
  0, 1, 1, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 1, 0, 1,
  1, 1,
];

export default function StreakCalendar() {
  return (
    <div
     className="
relative
overflow-hidden
rounded-3xl
border border-[#263b63]
bg-gradient-to-b
from-[#182334]
to-[#131b29]
p-8
shadow-[0_0_35px_rgba(59,130,246,.06)]
"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Chuỗi học tập
          </h2>

          <p className="text-slate-400 mt-1">
            Tháng 7, 2026
          </p>
        </div>

        <div className="text-right">
          <p className="text-slate-500 text-sm">
            Hiện tại
          </p>

          <h3 className="text-3xl font-bold text-red-400">
            🔥12
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">

        {days.map((item, index) => (
          <div
            key={index}
            className={`
            aspect-square
            rounded-xl
            border
            transition-all
            duration-300
            ${
              item
                ? "bg-emerald-500 border-emerald-400 hover:scale-105"
                : "bg-[#1c2438] border-[#2b3654]"
            }
          `}
          />
        ))}

      </div>
    </div>
  );
}