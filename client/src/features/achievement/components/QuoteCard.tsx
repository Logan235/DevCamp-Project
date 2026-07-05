export default function QuoteCard() {
return (
  <div
    className="
      h-full
      rounded-[30px]
      border border-[#2b3e66]
      bg-gradient-to-b
      from-[#171F2E]
      to-[#121827]
      p-8
      flex
      flex-col
      justify-between
    "
  >

      <h2 className="text-4xl font-bold text-white mt-8 leading-tight">

        Consistency beats

        <br />

        <span className="text-emerald-400">
          intensity.
        </span>

      </h2>

      <p className="text-slate-400 mt-6">

        Mỗi ngày chỉ cần tiến bộ 1%.

        Sau một năm bạn sẽ khác hoàn toàn.

      </p>

    </div>
  );
}