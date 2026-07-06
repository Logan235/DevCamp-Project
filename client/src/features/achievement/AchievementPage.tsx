import AchievementHeader from "./components/AchievementHeader";
import StatCard from "./components/StatCard";
import StreakCalendar from "./components/StreakCalendar";
import { stats } from "./AchievementData";
import WeeklyProgress from "./components/WeeklyProgress";
import RecentAchievement from "./components/RecentAchievement";
import LevelProgress from "./components/LevelProgress";
import QuoteCard from "./components/QuoteCard";
export default function AchievementPage() {
return (
 <div
className="
min-h-screen
text-white
bg-[#050816]
bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)]
bg-[size:48px_48px]
"
>
   <div className="max-w-7xl mx-auto px-8 pt-20 pb-12">
    <div
className="
absolute
left-1/2
top-40
-translate-x-1/2
w-[900px]
h-[900px]
rounded-full
bg-cyan-500/5
blur-[180px]
pointer-events-none
"
/>

      <AchievementHeader />

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>

      {/* Calendar + Weekly Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2">
          <StreakCalendar />
        </div>

        <WeeklyProgress />

      </div>

      {/* Recent Achievement + Right Panel */}
     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8 items-stretch">

  {/* Bên trái */}
  <div className="xl:col-span-2 h-full">
    <RecentAchievement />
  </div>

  {/* Bên phải */}
{/* Bên phải */}
<div className="flex flex-col gap-6 h-full">

  <LevelProgress />

  <div className="flex-1">
    <QuoteCard />
  </div>

</div>

</div>


    </div>
  </div>
);
}