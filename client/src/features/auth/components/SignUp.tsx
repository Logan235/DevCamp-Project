import { User, Mail, Lock } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi, loginWithGithub, loginWithGoogle } from "../api";

export function SignUp() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const renderErrorMessages = () => {
    if (!error) return null;
    let errorArray: string[] = [];

    if (typeof error === "string") {
      errorArray = error
        .replace(/(Password must|email must)/g, "|$1")
        .split("|")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    if (errorArray.length === 0) {
      errorArray = [error];
    }

    return (
      <div className="mb-6 p-4  text-red-400 text-xs rounded-lg animate-in fade-in duration-200">
        <ul className="list-disc list-inside space-y-1 text-red-500">
          {errorArray.map((msg, index) => (
            <li key={index} className="leading-relaxed">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const handleSignUp = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ tất cả các trường thông tin.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await registerApi({
        email,
        password,
        displayName,
      });

      navigate("/login");
    } catch (err: any) {
      const backendMessage = err.response?.data?.message;

      if (Array.isArray(backendMessage)) {
        setError(backendMessage.join(" "));
      } else {
        setError(backendMessage || "Tạo tài khoản thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">CodeQuest</h1>
          <p className="text-gray-400 mt-2">I Code, I Think, I Conquer</p>
        </div>

        {renderErrorMessages()}

        <div className="mb-4">
          <label className="block text-sm mb-2 text-gray-300">Họ và tên</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0b1220] border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-2 text-gray-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0b1220] border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 text-gray-300">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0b1220] border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
              disabled={isLoading}
              onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
            />
          </div>
        </div>

        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold transition text-white ${
            isLoading
              ? "bg-green-700 cursor-not-allowed opacity-70"
              : "bg-green-500 hover:bg-green-600 active:scale-[0.99]"
          }`}
        >
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">Hoặc tiếp tục với</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* Social */}
        <div className="space-y-3">
          <button
            onClick={loginWithGithub}
            disabled={isLoading}
            className="w-full border border-gray-700 py-3 rounded-lg hover:bg-[#1f2937] flex items-center justify-center gap-2 text-white text-sm transition"
          >
            <FaGithub size={18} />
            GitHub
          </button>
          <button
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full border border-gray-700 py-3 rounded-lg hover:bg-[#1f2937] flex items-center justify-center gap-2 text-white text-sm transition"
          >
            <FcGoogle size={18} />
            Google
          </button>
        </div>

        {/* Login */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
