import { User, Mail, Lock } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../api";

export function SignUp() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [passWord, setPassWord] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      setError("");

      await registerApi({
        email,
        passWord,
        displayName,
      });

      navigate("/login");
    } catch {
      setError("Failed to create an account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">CodeQuest</h1>

          <p className="text-gray-400 mt-2">I Code, I Think, I Conquer</p>
        </div>

        {/* Họ tên */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Họ và tên</label>

          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0b1220] border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Email</label>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0b1220] border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm mb-2">Mật khẩu</label>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />

            <input
              type="password"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0b1220] border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        </div>

        {/* Button */}
        <button
          onClick={handleSignUp}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition"
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
          <button className="w-full border border-gray-700 py-3 rounded-lg hover:bg-[#1f2937] flex items-center justify-center gap-2">
            <FaGithub size={18} />
            GitHub
          </button>
          <button className="w-full border border-gray-700 py-3 rounded-lg hover:bg-[#1f2937] flex items-center justify-center gap-2">
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
