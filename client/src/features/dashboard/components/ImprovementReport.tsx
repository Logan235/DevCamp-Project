export default function ImprovementReport() {
  return (
    <div className="bg-[#151c2c] border border-gray-800 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-6">
        Nhận xét & Gợi ý học tập tuần này
      </h3>

      <div className="space-y-6">
        {/* điểm mạnh */}
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Làm chủ rất tốt các Hàm xử lý mảng
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Bạn đã viết đúng cú pháp `.map()` và `.filter()` trong 5 bài thực
              hành liên tiếp mà không bị thiếu dấu ngoặc nhọn. Tốc độ gõ cải
              thiện đáng kể!
            </p>
          </div>
        </div>

        {/* điểm yếu */}
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Cần chú ý: Hàm mũi tên (Arrow Function)
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Đôi khi bạn vẫn quên từ khóa `return` khi bọc thân hàm trong dấu
              ngoặc nhọn `{}`. Hãy thử luyện lại 3 bài tập cơ bản về Arrow
              Function.
            </p>
          </div>
        </div>

        {/* điểm cần cải thiện */}
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Thói quen gõ code: Rất tích cực
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Việc duy trì gõ code đều đặn mỗi ngày đang giúp cơ tay của bạn
              quen với các ký tự đặc biệt như `{}`, `[]`, `=&gt;`. Tiếp tục phát
              huy nhé!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
