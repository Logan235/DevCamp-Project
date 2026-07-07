import { Button } from "../../components/common/Button";
import { NavBar } from "../NavBar";
import { useState, useEffect } from "react";
import { getMeApi } from "./api";

interface UserProfile {
  email: string;
  displayName: string;
  createdAt?: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getMeApi();
        setUser({
          email: data.email,
          displayName: data.displayName,
          createdAt: data.createdAt,
          password: "********",
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
        userAvatar="/d09df851e636fc7377e7a5fb048706c0.jpg"
        userName="anh Huy"
      />
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-[#1e2227] overflow-hidden bg-zinc-1010">
          <div className="flex flex-col items-center">
            {/* 1. Nền xanh lá (Banner): Phủ ở phần trên card */}
            <div className="w-full h-44 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-600 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative overflow-hidden">
              {/* Họa tiết lưới mờ Deep Tech trang trí */}
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px] opacity-15" />
            </div>

            {/* 2. Avatar: Kéo ngược lên trên bằng margin âm (-mt-[135px]) để trượt 3/4 vào vùng xanh */}
            <div className="relative -mt-33.75 mb-2 w-45 h-45 rounded-2xl border-4 border-zinc-950 shadow-xl overflow-hidden bg-zinc-800 z-10">
              <img
                src="/d09df851e636fc7377e7a5fb048706c0.jpg"
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
              <span className="font-medium truncate">{user.email}</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="uppercase tracking-widest text-muted-foreground mb-0.5 text-zinc-400">
                HỌ VÀ TÊN
              </span>
              <span className="font-medium truncate">{user.displayName}</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="uppercase tracking-widest text-muted-foreground mb-0.5 text-zinc-400">
                NGÀY BẮT ĐẦU
              </span>
              <span className="font-medium truncate">{user.createdAt}</span>
            </div>
            <div className="border-t border-[#1e2227] mx-6" />
            <div className="flex gap-3 justify-between">
              <div className="flex flex-col gap-3">
                <span className="uppercase tracking-widest text-muted-foreground mb-0.5 text-zinc-400">
                  MẬT KHẨU
                </span>
                <span className="font-medium truncate">
                  {showPassword ? user.password : "********"}
                </span>
              </div>
              <Button
                variant="normal"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
