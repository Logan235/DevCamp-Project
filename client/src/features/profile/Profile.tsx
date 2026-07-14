import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components/common/Button";
import { NavBar } from "../NavBar";
import { getMeApi, updateMeApi } from "./api";
import { setCredentials } from "../auth/slice";

interface UserProfile {
  email: string;
  displayName: string;
  createdAt?: string;
  avatar?: string;
  avatarUrl?: string;
  role?: "user" | "admin" | string;
  currentLevel?: string;
  xpTotal?: number;
}

export default function Profile() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMeApi();

        const profile: UserProfile = {
          email: data.email,
          displayName: data.displayName || data.email,
          createdAt: data.createdAt,
          avatar: data.avatar,
          avatarUrl: data.avatarUrl,
          role: data.role,
          currentLevel: data.currentLevel,
          xpTotal: data.xpTotal,
        };

        setUser(profile);
        setFormData(profile);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải hồ sơ người dùng.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchUserData();
  }, [isLoggedIn]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const updatedUser = await updateMeApi({
        displayName: formData.displayName?.trim(),
      });

      const profile: UserProfile = {
        email: updatedUser.email,
        displayName: updatedUser.displayName || updatedUser.email,
        createdAt: updatedUser.createdAt,
        avatar: updatedUser.avatar,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        currentLevel: updatedUser.currentLevel,
        xpTotal: updatedUser.xpTotal,
      };

      setUser(profile);
      setFormData(profile);
      dispatch(setCredentials(updatedUser));
      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Cập nhật hồ sơ thành công!",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Không thể cập nhật hồ sơ.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(user);
    }

    setIsEditing(false);
    setMessage(null);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <NavBar />

        <main className="min-h-screen bg-white dark:bg-[#050816] text-gray-600 dark:text-zinc-300 flex items-center justify-center px-4 transition-colors">
          <div className="w-full max-w-md rounded-2xl border border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/70 p-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Bạn chưa đăng nhập
            </h1>

            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-5">
              Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ cá nhân.
            </p>

            <Button variant="primary" to="/login">
              Đăng nhập
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <NavBar />
        <main className="min-h-screen bg-white dark:bg-[#050816] flex items-center justify-center transition-colors">
          <div className="text-gray-600 dark:text-zinc-400 animate-pulse font-medium">
            Đang tải hồ sơ người dùng...
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <NavBar />
        <main className="min-h-screen bg-white dark:bg-[#050816] flex items-center justify-center px-4 transition-colors">
          <div className="w-full max-w-md rounded-2xl border border-rose-300 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6 text-center text-rose-700 dark:text-rose-300">
            {error || "Không tìm thấy dữ liệu người dùng."}
          </div>
        </main>
      </div>
    );
  }

  const avatarSrc = user.avatar || user.avatarUrl;
  const displayInitial =
    user.displayName?.charAt(0)?.toUpperCase() ||
    user.email.charAt(0).toUpperCase();

  return (
    <div>
      <NavBar />

      <main
        className="min-h-screen bg-white dark:bg-[#050816] text-gray-900 dark:text-zinc-100 flex items-center justify-center px-4 py-12 transition-colors"
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-950 shadow-2xl transition-colors">
          <div className="w-full h-44 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] opacity-15" />
          </div>

          <div className="flex flex-col items-center -mt-20 px-5 pb-6">
            <div className="mb-4 w-36 h-36 rounded-2xl border-4 border-gray-50 dark:border-zinc-950 shadow-xl overflow-hidden bg-gray-200 dark:bg-zinc-800 z-10 flex items-center justify-center">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user.displayName || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-black text-gray-700 dark:text-white">
                  {displayInitial}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.displayName}
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              {user.email}
            </p>

            {message && (
              <div
                className={`w-full mt-5 p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="w-full mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="uppercase tracking-widest text-xs text-gray-400 dark:text-zinc-500">
                  Email
                </span>
                <span className="font-medium truncate text-gray-800 dark:text-zinc-200">
                  {user.email}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="uppercase tracking-widest text-xs text-gray-400 dark:text-zinc-500">
                  Họ và tên
                </span>

                {isEditing ? (
                  <input
                    name="displayName"
                    value={formData.displayName || ""}
                    onChange={handleChange}
                    className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Nhập tên hiển thị"
                  />
                ) : (
                  <span className="font-medium truncate text-gray-800 dark:text-zinc-200">
                    {user.displayName}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="uppercase tracking-widest text-xs text-gray-400 dark:text-zinc-500">
                  Vai trò
                </span>
                <span className="font-medium truncate text-gray-800 dark:text-zinc-200">
                  {user.role === "admin" ? "Admin" : "Người dùng"}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="uppercase tracking-widest text-xs text-gray-400 dark:text-zinc-500">
                  Ngày bắt đầu
                </span>
                <span className="font-medium truncate text-gray-800 dark:text-zinc-200">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "Chưa có dữ liệu"}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-zinc-800 pt-5 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="normal"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Hủy
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa hồ sơ
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
