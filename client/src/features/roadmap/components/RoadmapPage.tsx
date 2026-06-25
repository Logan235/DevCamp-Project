import { useState } from "react";
import { RoadmapHeader } from "./RoadmapHeader";
import { RoadmapSidebar } from "./RoadmapSidebar";
import { Connector } from "../../../components/common/Connector";
import { Node } from "../../../components/common/Node";
import { Preview } from "../../../components/common/Preview";
import { CheckCircle2, Compass, Award } from "lucide-react";
import StatCard from "../../dashboard/components/StatCard";
import bg from "../../../../public/bg.png";
import { useNavigate } from "react-router";
import { getMyRoadmapsApi } from "../api";
const [roadmaps, setRoadmaps] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  async function loadRoadmaps() {
    try {
      setIsLoading(true);
      const data = await getMyRoadmapsApi();
      setRoadmaps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  loadRoadmaps();
}, []);

const stepsData = [
  {
    id: "1",
    title: "Khai báo mảng cơ bản",
    xp: 200,
    status: "completed" as const,
    difficulty: "info" as const,
    x: 8,
    y: 70,
    desc: "Cách khởi tạo một mảng cơ bản trong bộ nhớ và truy cập phần tử qua chỉ số index.",
    concept:
      "Mảng là một cấu trúc dữ liệu tuyến tính lưu trữ các phần tử tuần tự kế tiếp nhau trong bộ nhớ RAM.",
    syntaxSnippet: "const fruits = ['Apple', 'Banana'];",
  },
  {
    id: "2",
    title: "Thêm/Xóa phần tử mảng",
    xp: 300,
    status: "completed" as const,
    difficulty: "info" as const,
    x: 20,
    y: 40,
    desc: "Học các phương thức tương tác trực tiếp lên mảng cũ như push, pop, shift, unshift.",
    concept:
      "Các hàm push() thêm cuối, pop() xóa cuối, unshift() thêm đầu và shift() xóa đầu mảng.",
    syntaxSnippet: "fruits.push('Orange');\nfruits.pop();",
  },
  {
    id: "3",
    title: "Hàm lọc mảng .filter()",
    xp: 400,
    status: "completed" as const,
    difficulty: "warning" as const,
    x: 34,
    y: 65,
    desc: "Trích xuất một mảng con thỏa mãn điều kiện nhất định mà không biến đổi mảng gốc.",
    concept:
      "Phương thức filter() tạo ra một mảng mới chứa tất cả các phần tử vượt qua bài test của hàm callback.",
    syntaxSnippet: "const cheapProducts = products.filter(p => p.price < 100);",
  },
  {
    id: "4",
    title: "Phương thức .map()",
    xp: 500,
    status: "current" as const,
    difficulty: "warning" as const,
    x: 48,
    y: 35,
    desc: "Duyệt qua từng phần tử mảng, biến đổi cấu trúc dữ liệu và sinh ra một mảng hoàn toàn mới.",
    concept:
      "Phương thức map() giúp bạn duyệt qua từng phần tử của một mảng cũ, biến đổi nó và trả về một mảng hoàn toàn mới mà không làm thay đổi mảng ban đầu.",
    syntaxSnippet:
      "const saleProducts = products.map(p => ({ ...p, price: p.price * 2 }));",
  },
  {
    id: "5",
    title: "Tính toán gộp với .reduce()",
    xp: 600,
    status: "locked" as const,
    difficulty: "success" as const,
    x: 62,
    y: 60,
    desc: "Tính toán dồn dịch các phần tử mảng thành một giá trị duy nhất (tổng số, object gộp).",
    concept:
      "Phương thức reduce() thực thi một hàm callback tích lũy trên từng phần tử để trả về một giá trị duy nhất.",
    syntaxSnippet:
      "const totalPrice = products.reduce((acc, p) => acc + p.price, 0);",
  },
  {
    id: "6",
    title: "Tìm kiếm phần tử .find()",
    xp: 400,
    status: "locked" as const,
    difficulty: "info" as const,
    x: 74,
    y: 30,
    desc: "Cách tìm ra phần tử đầu tiên hoặc vị trí index của nó trong một mảng lớn.",
    concept:
      "Phương thức find() trả về giá trị của phần tử đầu tiên trong mảng thỏa mãn hàm kiểm tra.",
    syntaxSnippet: "const found = products.find(p => p.id === 2);",
  },
  {
    id: "7",
    title: "Hợp nhất mảng (Flat & Concat)",
    xp: 500,
    status: "locked" as const,
    difficulty: "warning" as const,
    x: 86,
    y: 55,
    desc: "Làm phẳng mảng nhiều chiều phức tạp và nối các tập hợp dữ liệu lại với nhau.",
    concept:
      "Hàm flat() giúp làm phẳng mảng lồng nhau theo độ sâu chỉ định một cách tự động.",
    syntaxSnippet: "const dynamicMatrix = nestedArray.flat(2);",
  },
  {
    id: "8",
    title: "Thuật toán Sắp xếp mảng",
    xp: 800,
    status: "locked" as const,
    difficulty: "error" as const,
    x: 95,
    y: 35,
    desc: "Làm chủ hàm .sort() nâng cao, cơ chế compareFunction và thuật toán sắp xếp tối ưu.",
    concept:
      "Hàm sort() mặc định sắp xếp mảng theo thứ tự chuỗi Unicode, cần truyền hàm so sánh để xếp số chính xác.",
    syntaxSnippet: "nums.sort((a, b) => a - b); // Tăng dần",
  },
];

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [activeNodeId] = useState<string | null>("4"); // Mặc định chọn bài .map()
  const [previewData, setPreviewData] = useState<{
    title: string;
    concept: string;
    difficulty: "success" | "warning" | "error" | "info";
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);

  const activeNode = stepsData.find((s) => s.id === activeNodeId) || null;

  return (
    <div className="bg-[#0b0f19] min-h-screen text-zinc-300 font-sans antialiased overflow-x-hidden">
      <RoadmapHeader />

      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div
          className="lg:col-span-3 bg-[#111625]/40 border border-zinc-800/60 rounded-xl p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px] pointer-events-none z-0" />
          <div className="w-350 h-112.5 relative mt-10">
            <div className="absolute -top-7.5 left-2">
              <h2 className="text-2xl font-semibold text-white tracking-tight fixed">
                Các phương thức chính trong JavaScript
              </h2>
            </div>

            {stepsData.map((step, index) => {
              if (index === stepsData.length - 1) return null;
              const nextStep = stepsData[index + 1];
              return (
                <Connector
                  key={`line-${step.id}`}
                  status={nextStep.status}
                  x1={step.x}
                  y1={step.y}
                  x2={nextStep.x}
                  y2={nextStep.y}
                />
              );
            })}

            {stepsData.map((step) => (
              <div
                key={step.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${step.x}%`, top: `${step.y}%` }}
              >
                <Node
                  title={step.title}
                  xp={step.xp}
                  status={step.status}
                  isActive={activeNodeId === step.id}
                  onClick={() => navigate(`/lesson/${step.id}`)}
                  onMouseEnter={(e) => {
                    setPreviewData({
                      title: step.title,
                      concept: step.concept,
                      difficulty: step.difficulty,
                    });
                    setMousePos({ x: e.clientX, y: e.clientY });
                    setShowPreview(true);
                  }}
                  onMouseMove={(e) => {
                    setMousePos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setShowPreview(false);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <RoadmapSidebar node={activeNode} />
        </div>
      </main>

      {previewData && (
        <Preview
          title={previewData.title}
          conceptText={previewData.concept}
          difficulty={previewData.difficulty}
          x={mousePos.x}
          y={mousePos.y}
          visible={showPreview}
        />
      )}

      <footer className="max-w-7xl mx-auto px-6 md:px-8 pb-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          variant="solved"
          icon={<CheckCircle2 fill="currentColor" />}
          value="3"
          label="Chủ đề đã hoàn thành"
          subText="+1 trong tuần này"
          subColor="text-emerald-400/80"
        />

        <StatCard
          variant="xp"
          icon={<Compass />}
          value="37%"
          label="Tiến độ lộ trình hiện tại"
          subText="Còn 5 bài học phía trước"
          subColor="text-blue-400/80"
        />

        <StatCard
          variant="level"
          icon={<Award />}
          value="Lvl. 3"
          label="Trình độ cú pháp"
          subText=""
          progress={65}
        />
      </footer>
    </div>
  );
}
