export default function LevelProgress() {
  return (
    <div className="
relative
overflow-hidden
rounded-3xl
border border-[#2b4675]
bg-[linear-gradient(180deg,#171d2d_0%,#121826_100%)]
p-8
shadow-[0_0_40px_rgba(59,130,246,.08)]
">

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Tiến độ cấp độ
          </h2>

          <p className="text-slate-400 mt-1">
            Còn 1,580 XP để lên Level 4
          </p>

        </div>

        <div
          className="
          w-20
          h-20
          rounded-full
          border-4
          border-yellow-400
          flex
          flex-col
          items-center
          justify-center
        "
        >
          <span className="text-slate-400 text-sm">
            Level
          </span>

          <span className="text-2xl font-bold text-yellow-400">
            3
          </span>
        </div>

      </div>

      <div className="mt-8">

        <div className="flex justify-between mb-2">

          <span className="text-yellow-400 font-bold">
            3420 XP
          </span>

          <span className="text-slate-500">
            5000 XP
          </span>

        </div>

        <div className="h-4 bg-[#1f2937] rounded-full overflow-hidden">

          <div
            className="
            h-full
            w-[68%]
            rounded-full
            bg-gradient-to-r
            from-yellow-500
            to-yellow-300
          "
          />

        </div>

      </div>

      <div className="grid grid-cols-3 gap-5 mt-8">

        <div className="rounded-2xl bg-[#162133] p-5 text-center">

          <h3 className="text-3xl font-bold text-blue-400">
            56
          </h3>

          <p className="text-slate-400 mt-2">
            Bài học
          </p>

        </div>

        <div className="rounded-2xl bg-[#132922] p-5 text-center">

          <h3 className="text-3xl font-bold text-emerald-400">
            8
          </h3>

          <p className="text-slate-400 mt-2">
            Thử thách
          </p>

        </div>

        <div className="rounded-2xl bg-[#1e1d3b] p-5 text-center">

          <h3 className="text-3xl font-bold text-violet-400">
            7
          </h3>

          <p className="text-slate-400 mt-2">
            Huy hiệu
          </p>

        </div>

      </div>

    </div>
  );
}