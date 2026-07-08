import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      return;
    }

    const user = searchParams.get("user");
    const parsedUser = user ? JSON.parse(decodeURIComponent(user)) : null;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    if (parsedUser) {
      localStorage.setItem("user", JSON.stringify(parsedUser));
    } else {
      localStorage.setItem("user", JSON.stringify({ loggedInViaOAuth: true }));
    }

    navigate("/assessment", { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400 text-sm">
        Logging in with OAuth... Please wait while we redirect you to the
        assessment.
      </p>
    </div>
  );
}
