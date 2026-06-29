import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      Đang đăng nhập...
    </div>
  );
}
