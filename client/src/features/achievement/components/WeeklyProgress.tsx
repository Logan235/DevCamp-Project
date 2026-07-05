export default function WeeklyProgress() {
  return (
    <div
      className="
      relative
      overflow-hidden
      rounded-3xl
      border border-[#2d3c5d]
      bg-[linear-gradient(180deg,#171d2d_0%,#111827_100%)]
      p-8
      shadow-[0_0_35px_rgba(59,130,246,.08)]
      "
    >
      {/* Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <h2 className="text-2xl font-bold text-white">
        Tiến độ tuần
      </h2>

      <p className="text-[#8ea3c8] mt-2">
        Theo dõi thời gian học trong tuần
      </p>

      {/* Chart */}
      <div className="mt-8">

        <svg
          viewBox="0 0 320 180"
          className="w-full h-52"
        >
          {/* Grid */}
          {[30, 60, 90, 120, 150].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="320"
              y2={y}
              stroke="#243147"
              strokeWidth="1"
            />
          ))}

          {/* Glow */}
          <path
            d="
            M20 140
            C60 120,80 80,110 90
            C140 100,170 40,210 60
            C240 70,260 20,300 35
          "
            fill="none"
            stroke="#38bdf8"
            strokeWidth="10"
            opacity=".12"
            strokeLinecap="round"
          />

          {/* Main line */}
          <path
            d="
            M20 140
            C60 120,80 80,110 90
            C140 100,170 40,210 60
            C240 70,260 20,300 35
          "
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Points */}
          {[
            [20, 140],
            [110, 90],
            [210, 60],
            [300, 35],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="7"
                fill="#38bdf8"
                opacity=".15"
              />

              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill="#38bdf8"
              />
            </g>
          ))}
        </svg>

        {/* Days */}
        <div className="flex justify-between text-sm text-slate-500 mt-2 px-1">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
          <span>CN</span>
        </div>

      </div>

      {/* Progress */}
      <div className="mt-8">

        <div className="flex justify-between mb-2">
          <span className="text-slate-400">
            Hoàn thành mục tiêu
          </span>

          <span className="text-sky-400 font-semibold">
            82%
          </span>
        </div>

        <div className="h-3 rounded-full bg-[#1d263b] overflow-hidden">

          <div
            className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-sky-500
            via-cyan-400
            to-blue-500
            "
            style={{
              width: "82%",
            }}
          />

        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">

        <div className="rounded-2xl bg-[#162133] p-4 text-center">
          <p className="text-3xl font-bold text-white">
            12h
          </p>

          <span className="text-slate-400 text-sm">
            Tuần này
          </span>
        </div>

        <div className="rounded-2xl bg-[#162133] p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">
            5
          </p>

          <span className="text-slate-400 text-sm">
            Ngày học
          </span>
        </div>

        <div className="rounded-2xl bg-[#162133] p-4 text-center">
          <p className="text-3xl font-bold text-green-400">
            +320
          </p>

          <span className="text-slate-400 text-sm">
            XP
          </span>
        </div>

      </div>
    </div>
  );
}