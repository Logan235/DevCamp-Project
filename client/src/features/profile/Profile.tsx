import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Calendar,
  Award,
  Flame,
  Shield,
  Layers,
  Edit3,
  X,
  Check,
} from "lucide-react";
import { NavBar } from "../NavBar";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { getMeApi, updateMeApi } from "./api";

interface UserProfile {
  email: string;
  displayName: string;
  createdAt?: string;
  role?: string;
  currentLevel?: string;
  xpTotal?: number;
  streakCount?: number;
}

export default function Profile() {
  const { userlog, isLoggedIn } = useSelector((state: any) => state.auth);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{ displayName: string }>({
    displayName: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const mapLevelToNumber = (levelStr: string): number => {
    switch (levelStr?.toLowerCase()) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "advanced":
        return 3;
      default:
        return 1;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn || !userlog) return;
      try {
        setLoading(true);
        const data = await getMeApi();

        const profileData = {
          email: data.email,
          displayName: data.displayName,
          createdAt: data.createdAt,
          role: data.role,
          currentLevel: data.currentLevel,
          xpTotal: data.xpTotal,
          streakCount: data.streakCount,
        };

        setUser(profileData);
        setFormData({ displayName: data.displayName || "" });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Không thể tải thông tin người dùng.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn, userlog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ displayName: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      setMessage({ type: "error", text: "Tên hiển thị không được để trống." });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const updatedData = await updateMeApi({
        displayName: formData.displayName,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: updatedData.displayName || formData.displayName,
            }
          : null,
      );
      setIsEditing(false);
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "Đã xảy ra lỗi khi lưu." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setFormData({ displayName: user.displayName });
    setIsEditing(false);
    setMessage(null);
  };

  if (!isLoggedIn || !userlog) {
    return <NavBar isLoggedIn={false} />;
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#050b17] text-white">
        <div className="animate-pulse text-slate-400">
          Đang tải thông tin hồ sơ...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full min-h-screen flex flex-col gap-5 items-center justify-center bg-[#050b17] px-5">
        <Badge variant="error">Lỗi tải thông tin</Badge>
        <p className="max-w-xl text-center text-sm text-slate-400">
          {error || "Không tìm thấy dữ liệu."}
        </p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto min-h-screen flex flex-col bg-[#050b17] text-slate-300">
      <NavBar
        isLoggedIn={true}
        userName={userlog.displayName || userlog.email}
        role={userlog.role}
        currentLevel={mapLevelToNumber(userlog.currentLevel)}
        xpTotal={userlog.xpTotal || 0}
        userAvatar={userlog.avatar}
      />

      <main className="m-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#18263d] bg-[radial-gradient(circle_at_center,#0b2530_0%,#060f1d_100%)] p-6 shadow-[0_0_60px_rgba(59,130,246,0.08)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] opacity-5" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-[#1e293b] bg-slate-800 shadow-2xl sm:h-28 sm:w-28 md:h-32 md:w-32">
              <img
                src={userlog.avatar}
                className="w-full h-full object-cover"
                alt="User Avatar"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {user.displayName}
                </h1>
                <span className="capitalize px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mx-auto sm:mx-0">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Thành viên từ:{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
          <div className="md:col-span-2 rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Thông tin cá nhân
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Địa chỉ Email
                </label>
                <div className="w-full p-3 bg-[#050b17] rounded-xl text-slate-400 border border-slate-800 text-sm select-none">
                  {user.email}
                  <span className="text-xs ml-2 text-slate-600 italic">
                    (Không thể thay đổi)
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Tên hiển thị
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={handleChange}
                    disabled={saving}
                    maxLength={30}
                    className="w-full p-3 bg-[#050b17] rounded-xl text-white border border-blue-500/40 focus:outline-none focus:border-blue-500 transition text-sm"
                    placeholder="Nhập tên hiển thị mới..."
                  />
                ) : (
                  <div className="w-full p-3 bg-[#050b17] rounded-xl text-slate-200 border border-slate-800 text-sm font-medium">
                    {user.displayName}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 flex justify-end gap-3">
              {!isEditing ? (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4 inline mr-1" /> Hủy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />{" "}
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-lg transition-all duration-300 hover:border-[#3b82f6]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#13294b]">
                <Award className="text-[#60a5fa] w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-white">
                {user.xpTotal ?? 0}{" "}
                <span className="text-sm font-normal text-slate-500">XP</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tổng kinh nghiệm tích lũy
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-lg transition-all duration-300 hover:border-[#c084fc]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a163d]">
                <Layers className="text-[#c084fc] w-5 h-5" />
              </div>
              <div className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-sm font-bold w-fit capitalize">
                {user.currentLevel || "Beginner"}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Trình độ lập trình hiện tại
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e3a2a] bg-[#0f172a] p-5 shadow-lg transition-all duration-300 hover:border-[#22c55e]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#14532d]">
                <Flame className="text-[#22c55e] w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-[#4ade80]">
                {user.streakCount ?? 0}{" "}
                <span className="text-sm font-normal text-slate-500">ngày</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Chuỗi ngày học tập liên tục
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-lg">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Shield className="text-slate-400 w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-slate-300 capitalize">
                Quyền hạn: {user.role || "User"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ID: {userlog._id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
