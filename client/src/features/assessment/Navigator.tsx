import { Button } from "../../components/common/Button";

type NavigatorProps = {
  totalquest: number;
  currentQuest: number;
  setCurrentQuest: (quest: number) => void;
  ans: Record<number, string>;
  flag: number[];
};

export default function Navigator({
  totalquest,
  currentQuest,
  setCurrentQuest,
  ans,
  flag = [],
}: NavigatorProps) {
  return (
    <div className="grid grid-cols-5 gap-2 w-max justify-items-center">
      {[...Array(totalquest)].map((_, i) => {
        const questionNum = i + 1;
        let btnClass = "w-11 h-11 rounded-lg ";
        const isFlag = flag.includes(questionNum);

        if (questionNum === currentQuest) {
          btnClass +=
            "border border-blue-600 bg-blue-950 text-blue-400 text-[14px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
        } else if (questionNum in ans) {
          btnClass +=
            "bg-emerald-950 text-emerald-500 border border-emerald-800";
        } else {
          btnClass += "bg-slate-800 text-slate-500";
        }

        return (
          <Button
            variant="normal"
            key={questionNum}
            className={`relative ${btnClass}`}
            onClick={() => setCurrentQuest(questionNum)}
            type="button"
          >
            {questionNum}
            {isFlag && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-[#0b1220]"></span>
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
