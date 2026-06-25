import { Button } from "../../components/common/Button";

type ConfirmProps = {
  showConfirm: boolean;
  setshowConfirm: (showConfirm: boolean) => void;
  handleSubmit: () => void;
};

export default function Confirm({
  showConfirm,
  setshowConfirm,
  handleSubmit,
}: ConfirmProps) {
  if (!showConfirm) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="
w-120
rounded-[28px]
bg-linear-to-b
from-[#0f172a]
to-[#0b1220]
border border-[#23314a]
p-10
shadow-[0_20px_60px_rgba(0,0,0,0.7)]
"
      >
        <div className="text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-5">
            CODEQUEST
          </div>

          <h2 className="text-3xl font-bold text-white">
            Hoàn thành bài đánh giá
          </h2>

          <p className="mt-4 text-lg text-slate-300">
            Bạn có chắc chắn muốn nộp bài?
          </p>

          <p className="mt-3 text-sm text-slate-400 leading-6 max-w-sm mx-auto">
            Sau khi nộp, kết quả sẽ được lưu lại và bạn sẽ không thể thay đổi
            câu trả lời.
          </p>
        </div>
        <div className="my-8 border-t border-slate-800"></div>
        <div className="flex gap-3 mt-8">
          <Button
            variant="normal"
            className="
    flex-1
    border
    border-slate-700
    hover:border-slate-500
  "
            onClick={() => setshowConfirm(false)}
          >
            Quay lại
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onClick={() => handleSubmit()}
          >
            Nộp bài
          </Button>
        </div>
      </div>
    </div>
  );
}
