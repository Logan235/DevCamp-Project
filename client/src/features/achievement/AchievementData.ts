import {
  BookOpen,
  Clock3,
  Flame,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

export const stats = [
  {
    title: "Bài đã học",
    value: "56",
    icon: BookOpen,
     color: "text-blue-400",
    glow: "bg-blue-500",
  },
  {
    title: "Thời gian học",
    value: "24h 35m",
    icon: Clock3,
    color: "text-emerald-400",
  },
  {
    title: "Chuỗi học",
    value: "12 ngày",
    icon: Flame,
    color: "text-red-400",
  },
  {
    title: "XP tích lũy",
    value: "3,420 XP",
    icon: Star,
    color: "text-yellow-400",
  },
];

export const recentAchievements = [
  {
    title: "Chuỗi 12 ngày",
    desc: "Duy trì học liên tục trong 12 ngày.",
    time: "Hôm nay",
    icon: Flame,
    color: "text-red-400",
  },
  {
    title: "Hoàn thành 50 bài học",
    desc: "Đạt cột mốc 50 bài học.",
    time: "Hôm qua",
    icon: BookOpen,
    color: "text-blue-400",
  },
  {
    title: "Thử thách đầu tiên",
    desc: "Hoàn thành thử thách đầu tiên.",
    time: "3 ngày trước",
    icon: Trophy,
    color: "text-yellow-400",
  },
  {
    title: "500 XP",
    desc: "Tích lũy được 500 XP.",
    time: "5 ngày trước",
    icon: Zap,
    color: "text-purple-400",
  },
];