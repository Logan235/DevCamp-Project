import { Button } from "./components/common/Button";
import { Route, Routes } from "react-router";
import { Login } from "./features/auth/components/Login";
import { SignUp } from "./features/auth/components/SignUp";
import { CodeLayout } from "./features/editor/components/CodeLayout";
import { NavBar } from "./features/NavBar";
import RoadmapPage from "./features/roadmap/components/RoadmapPage";
import Dashboard from "./features/dashboard/components/Dashboard";
import Asssessment from "./features/assessment/Assessment";
import Result from "./features/assessment/Result";
import LessonPage from "./features/roadmap/components/LessonPage";
import { AdminLayout } from "./features/admin/components/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OAuthCallback } from "./features/auth/components/OAuthCallback";
import Profile from "./features/profile/Profile";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-[#050816] text-white">
            {/* Navbar */}
            <NavBar isLoggedIn={false} />

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center mt-28 px-6">
              <h1 className="text-6xl font-bold text-blue-400 mb-5 tracking-tight">
                CodeQuest
              </h1>

              <h2 className="text-4xl font-extrabold mb-5 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                I Code, I Think, I Conquer
              </h2>

              <p className="text-gray-400 max-w-2xl mb-10 text-lg leading-relaxed">
                Đập tan tư duy lối mòn "Copy-Paste". Khai phóng bản năng giải
                quyết vấn đề của một Kỹ sư Phần mềm thực thụ.
              </p>

              <Button variant="primary" size="xlg" to="/login">
                Đánh giá năng lực ngay
              </Button>
            </section>

            {/* Features Section */}
            <section className="grid md:grid-cols-3 gap-8 px-10 mt-28 pb-20 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800/60 hover:border-blue-500/80 transition-all duration-300 shadow-xl group">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                  AI Mind Mirror
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Phân tích chuyên sâu tư duy thuật toán và phong cách giải
                  quyết vấn đề độc quyền của riêng bạn, vượt trội hơn các công
                  cụ chấm điểm thông thường.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800/60 hover:border-blue-500/80 transition-all duration-300 shadow-xl group">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                  Adaptive Roadmap
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Lộ trình học tập cá nhân hóa, tự động tinh chỉnh linh hoạt dựa
                  trên tiến độ thực tế và tốc độ tiếp thu của từng học viên.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800/60 hover:border-blue-500/80 transition-all duration-300 shadow-xl group">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                  Targeted Sandbox
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Trình luyện tập thông minh giúp cô lập và tối ưu hóa các mảng
                  kiến thức còn yếu thông qua hệ thống bài tập thực chiến bổ
                  trợ.
                </p>
              </div>
            </section>
          </div>
        }
      ></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/editor"
        element={
          <ProtectedRoute>
            <CodeLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:challengeId"
        element={
          <ProtectedRoute>
            <CodeLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/assessment" element={<Asssessment />} />
      <Route path="/assessment/:challengeId" element={<Asssessment />} />
      <Route path="/result" element={<Result />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route path="/lesson/:id" element={<LessonPage />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
