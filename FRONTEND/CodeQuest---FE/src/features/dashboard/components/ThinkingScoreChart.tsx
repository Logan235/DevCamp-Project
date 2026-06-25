export default function ThinkingScoreChart() {
  return (
    <div className="bg-[#151c2c] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-white font-semibold mb-6">
          Tần suất luyện gõ cú pháp
        </h3>
        <div className="relative w-full h-48">
          {/* Trục Y */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 pr-2 border-r border-gray-800/50 w-8 text-right">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* đồ thị */}
          <div className="ml-8 h-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,60 Q 25,50 50,40 T 100,20 L 100,100 L 0,100 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M 0,60 Q 25,50 50,40 T 100,20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Trục X */}
        <div className="flex justify-between text-[10px] text-gray-500 mt-2 ml-8 pl-1">
          <span>Thứ 2</span>
          <span>Thứ 3</span>
          <span>Thứ 4</span>
          <span>Thứ 5</span>
          <span>Thứ 6</span>
          <span>Thứ 7</span>
          <span>Chủ Nhật</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-800/50">
        Chỉ số gõ code chính xác và không sai chính tả (syntax error) của bạn đã
        tăng 30% tuần này!
      </p>
    </div>
  );
}
