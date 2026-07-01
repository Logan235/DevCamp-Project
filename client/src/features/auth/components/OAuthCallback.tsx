import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // hook của react-router-dom để quản lý query params

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    localStorage.setItem("user", JSON.stringify({ loggedInViaOAuth: true }));

    navigate("/dashboard");
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400 text-sm">
        Đang đồng bộ tài khoản với CodeQuest...
      </p>
    </div>
  );
}
