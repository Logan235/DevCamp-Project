// import React from "react";
import { Flame, BarChart3, Award, CheckCircle2 } from "lucide-react";
import StatCard from "./StatCard";
import ThinkingScoreChart from "./ThinkingScoreChart";
import SkillRadarChart from "./SkillRadarChart";
import ImprovementReport from "./ImprovementReport";
import { NavBar } from "../../NavBar";
import { Button } from "../../../components/common/Button";

export default function Dashboard({ userName = "anh Huy" }) {
  return (
    <div className="bg-[#0b0f19] min-h-screen text-gray-300 font-sans antialiased selection:bg-blue-500/30">
      <NavBar
        isLoggedIn={true}
        userAvatar="/d09df851e636fc7377e7a5fb048706c0.jpg"
        userName={userName}
      />

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <div className=" flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Chào mừng trở lại,{" "}
              <span className="text-blue-400">{userName}</span>
            </h1>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => console.log("Navigating to next lesson...")}
          >
            Bài kế tiếp →
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            variant="streak"
            icon={<Flame fill="currentColor" />}
            value="14"
            label="Streak"
            subText="Keep your streak!"
            subColor="text-orange-400/80"
          />
          <StatCard
            variant="xp"
            icon={<BarChart3 />}
            value="1,250"
            label="EXP"
            subText="+180 exp"
            subColor="text-emerald-400"
          />
          <StatCard
            variant="level"
            icon={<Award />}
            value="Lvl. 3"
            label="Level của bạn"
            subText=""
            progress={65}
          />
          <StatCard
            variant="solved"
            icon={<CheckCircle2 />}
            value="23"
            label="Bài toán đã giải quyết"
            subText="+5 bài trong tuần này"
            subColor="text-emerald-400"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111625] border border-gray-800/80 rounded-lg p-1">
            <ThinkingScoreChart />
          </div>
          <div className="bg-[#111625] border border-gray-800/80 rounded-lg p-1">
            <SkillRadarChart />
          </div>
        </div>

        {/* Report Section */}
        <div className="bg-[#111625] border border-gray-800/80 rounded-lg">
          <ImprovementReport />
        </div>
      </main>
    </div>
  );
}
