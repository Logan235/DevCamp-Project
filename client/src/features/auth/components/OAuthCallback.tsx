import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation(); // get the information from the URL

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userString = params.get("user");

    // 1. Check if there is enough information, then save it to localStorage.
    if (accessToken && refreshToken && userString) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // 2. Decode the user string and save it
      localStorage.setItem("user", decodeURIComponent(userString));

      // 3. Navigate to the dashboard, replacing the callback page in the history
      navigate("/dashboard", { replace: true });
    } else {
      // 4. If information is missing, go back to the login page
      console.error(
        "OAuth callback error: Missing required parameters. Received:",
        {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          user: !!userString,
        },
      );
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-400 text-sm">
        Đang đồng bộ tài khoản với CodeQuest...
      </p>
    </div>
  );
}
