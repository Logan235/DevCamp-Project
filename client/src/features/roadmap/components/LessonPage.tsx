import { useParams, useNavigate } from "react-router";
import { Button } from "../../../components/common/Button";
import { lessons } from "./LessonData";
export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = lessons[id as keyof typeof lessons];
  
  if (!lesson) {
  return (
    <div className="text-white p-10">
      Không tìm thấy bài học
    </div>
  );
}
  return (
   <div className="min-h-screen bg-[#050816] p-10">
  <div
    className="
      max-w-5xl
      mx-auto
      rounded-3xl
      border border-[#18263d]
      bg-[radial-gradient(circle_at_center,#0b2530_0%,#060f1d_100%)]
      p-10
      shadow-[0_0_50px_rgba(59,130,246,0.08)]
    "
  >
   <h1 className="text-4xl font-bold text-white mb-8">
  {lesson.title}
</h1>

    <div className="space-y-6 text-slate-300 leading-8">
<pre className="whitespace-pre-wrap text-slate-300 leading-8 font-sans">
  {lesson.description}
</pre>
      <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800">
        <h3 className="text-blue-400 font-semibold mb-3">
          Cú pháp
        </h3>

    <pre className="text-green-400 overflow-x-auto">
{lesson.syntax}
</pre>
      </div>

      <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800">
        <h3 className="text-blue-400 font-semibold mb-3">
          Ví dụ
        </h3>

     <pre className="text-green-400 overflow-x-auto">
{lesson.example}
</pre>
      </div>
<div className="fixed bottom-8 right-8 z-50">
  <Button
    variant="primary"
    onClick={() => navigate("/editor")}
   className="
px-6 py-3
rounded-xl
bg-gradient-to-r
from-[#1d4ed8]
to-[#2563eb]
text-white
font-semibold
hover:scale-105
transition-all
shadow-[0_0_20px_rgba(37,99,235,0.25)]
"
  >
    Bắt đầu code →
  </Button>
</div>
    </div>
  </div>
</div>


  );
}