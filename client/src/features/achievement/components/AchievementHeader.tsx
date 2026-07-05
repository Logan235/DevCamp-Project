import { Award } from "lucide-react";

export default function AchievementHeader() {
  return (
    <div className="mb-16">
  <div
    className="
      inline-flex
      items-center
      gap-2
      px-4
      py-1.5
      rounded-full
      border
      border-[#2d4b86]
      bg-[#0d1730]
      text-[#4ea2ff]
      text-xs
      font-semibold
      tracking-[0.18em]
      uppercase
    "
  >
    <Award size={12} />
    CODEQUEST
  </div>

  <h1
    className="
      mt-8
      text-[72px]
      font-extrabold
      leading-[1.08]
      tracking-[-0.03em]
      text-white
    "
  >
    Thành tựu
  </h1>

  <p
    className="
      mt-6
      text-[22px]
      leading-8
      text-[#7B89A8]
    "
  >
    Theo dõi tiến trình học tập và những cột mốc bạn đã đạt được.
  </p>
</div>
  );
}
