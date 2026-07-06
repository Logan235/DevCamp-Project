import {
  BookOpen,
  Trophy,
  Flame,
  Zap,
} from "lucide-react";

const achievements = [
  {
    icon: Flame,
    title: "Chuỗi 12 ngày",
    desc: "Duy trì học liên tục trong 12 ngày không gián đoạn.",
    time: "Hôm nay, 09:14",
    color: "text-red-400",
    glow: "bg-red-500",
  },
  {
    icon: BookOpen,
    title: "Hoàn thành 50 bài học",
    desc: "Đạt cột mốc 50 bài học — nửa chặng đường đến 100!",
    time: "Hôm qua, 21:05",
    color: "text-blue-400",
    glow: "bg-blue-500",
  },
  {
    icon: Trophy,
    title: "Hoàn thành thử thách đầu tiên",
    desc: "Vượt qua thử thách lập trình đầu tiên với điểm tuyệt đối.",
    time: "3 ngày trước",
    color: "text-yellow-400",
    glow: "bg-yellow-500",
  },
  {
    icon: Zap,
    title: "Kiếm được 500 XP",
    desc: "Tích lũy đủ 500 XP từ các bài học và thử thách.",
    time: "5 ngày trước",
    color: "text-violet-400",
    glow: "bg-violet-500",
  },
];

export default function RecentAchievement() {
  return (
  <div
  className="
    relative
    overflow-hidden
    rounded-[30px]
    border border-[#263b63]
    bg-gradient-to-b
    from-[#171F2E]
    via-[#151C2B]
    to-[#121827]
    px-8
    py-8
    shadow-[0_15px_40px_rgba(0,0,0,.25)]
  "
>
      <h2 className="text-[22px] font-bold text-white">
        Thành tựu gần đây
      </h2>

      <p className="text-[#8EA1C5] mt-2 mb-8">
        Những cột mốc bạn vừa đạt được
      </p>
      <div className="relative">
        <div
          className="
            absolute
            left-6
            top-4
            bottom-4
            w-px
            bg-gradient-to-b
            from-[#425578]
            via-[#34445F]
            to-transparent
            opacity-60
          "
        />

        <div className="space-y-9">

          {achievements.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="relative flex items-start gap-6"
              >
                {/* Glow */}
                <div
                  className={`
                    absolute
                    left-0
                    top-0
                    w-12
                    h-12
                    rounded-full
                    blur-xl
                    opacity-25
                    ${item.glow}
                  `}
                />

                {/* Icon */}
                <div
                  className="
                    relative
                    z-10
                    w-12
                    h-12
                    rounded-full
                    border
                    border-[#30476C]
                    bg-[#111827]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon
                    className={`w-6 h-6 ${item.color}`}
                  />
                </div>

                {/* Nội dung */}
                <div className="flex-1">

                  <h3 className="text-[18px] font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-[#95A4C3] leading-7">
                    {item.desc}
                  </p>

                  <p className="mt-3 text-sm text-[#64748B]">
                    {item.time}
                  </p>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}