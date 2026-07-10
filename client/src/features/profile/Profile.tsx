import { Button } from "../../components/common/Button";
import { NavBar } from "../NavBar";
import { useState, useEffect } from "react";
import { getMeApi } from "./api";
import { useSelector } from "react-redux";

interface UserProfile {
  email: string;
  displayName: string;
  createdAt?: string;
}

export default function Profile() {
  const { userlog, isLoggedIn } = useSelector((state: any) => state.auth);
  if (!isLoggedIn || !userlog) {
    return <NavBar isLoggedIn={false} />;
  }
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Gọi API gửi dữ liệu về Backend
      const response = await fetch(
        "https://api.codequest.com/v1/user/profile",
        {
          method: "PUT", // Hoặc PATCH tùy quy chuẩn của BE
          body: JSON.stringify(formData),
        },
      );
      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin. Vui lòng thử lại!");
      }

      const updatedUser: UserProfile = await response.json();

      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "Đã xảy ra lỗi không xác định." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setFormData(user);
    setIsEditing(false);
    setMessage(null);
  };

  if (!user) return <div className="text-zinc-400">Đang tải...</div>;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getMeApi();
        setUser({
          email: data.email,
          displayName: data.displayName,
          createdAt: data.createdAt,
        });
        setFormData({
          email: data.email,
          displayName: data.displayName,
          createdAt: data.createdAt,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error occurred while fetching user data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-400 animate-pulse">
        Loading user information...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">
        {error || "User data not found."}
      </div>
    );
  }
  return (
    <div>
      <NavBar
        isLoggedIn={true}
        userName={userlog.displayName || userlog.email}
        role={userlog.role}
        currentLevel={mapLevelToNumber(userlog.currentLevel)}
        xpTotal={userlog.xpTotal || 0}
        userAvatar={userlog.avatar}
      />
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-[#1e2227] overflow-hidden bg-zinc-1010">
          {message && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="flex flex-col items-center">
            {/* 1. Nền xanh lá (Banner): Phủ ở phần trên card */}
            <div className="w-full h-44 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative overflow-hidden">
              {/* Họa tiết lưới mờ Deep Tech trang trí */}
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] opacity-15" />
            </div>

            {/* 2. Avatar: Kéo ngược lên trên bằng margin âm (-mt-[135px]) để trượt 3/4 vào vùng xanh */}
            <div className="relative -mt-33.75 mb-2 w-45 h-45 rounded-2xl border-4 border-zinc-950 shadow-xl overflow-hidden bg-zinc-800 z-10">
              <img
                src={userlog.avatar}
                className="w-full h-full object-cover"
                alt="User Avatar"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 p-5">
            <div className="border-t border-[#1e2227] mx-6" />
            <div className="flex flex-col gap-3">
              <span className="uppercase tracking-widest text-muted-foreground mb-0.5 text-zinc-400">
                EMAIL
              </span>
              <div className="font-medium truncate">
                {user.email}
                <span className="text-[10px] ml-2 text-zinc-600">
                  (Không thể chỉnh sửa)
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="uppercase tracking-widest text-muted-foreground mb-0.5 text-zinc-400">
                HỌ VÀ TÊN
              </span>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={formData.displayName || ""}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full p-2.5 bg-zinc-950 rounded-lg text-zinc-100 border border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <span className="font-medium truncate">{user.displayName}</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <span className="uppercase tracking-widest text-muted-foreground mb-0.5 text-zinc-400">
                NGÀY BẮT ĐẦU
              </span>
              <span className="font-medium truncate">{user.createdAt}</span>
            </div>
            <div className="border-t border-[#1e2227] mx-6" />
            <div className="flex justify-end gap-3">
              {!isEditing ? (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
