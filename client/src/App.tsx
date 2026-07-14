import React, { Suspense, useEffect, useRef, useState } from "react";
import { Route, Routes, Navigate } from "react-router";
import { Button } from "./components/common/Button";
import { NavBar } from "./features/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useSelector } from "react-redux";

// Lazy load components
const Login = React.lazy(() =>
  import("./features/auth/components/Login").then((m) => ({
    default: m.Login,
  })),
);
const SignUp = React.lazy(() =>
  import("./features/auth/components/SignUp").then((m) => ({
    default: m.SignUp,
  })),
);
const CodeLayout = React.lazy(() =>
  import("./features/editor/components/CodeLayout").then((m) => ({
    default: m.CodeLayout,
  })),
);
const RoadmapPage = React.lazy(
  () => import("./features/roadmap/components/RoadmapPage"),
);
const Asssessment = React.lazy(
  () => import("./features/assessment/Assessment"),
);
const Result = React.lazy(() => import("./features/assessment/Result"));
const LessonPage = React.lazy(
  () => import("./features/roadmap/components/LessonPage"),
);
const AdminLayout = React.lazy(() =>
  import("./features/admin/components/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const OAuthCallback = React.lazy(() =>
  import("./features/auth/components/OAuthCallback").then((m) => ({
    default: m.OAuthCallback,
  })),
);
const Profile = React.lazy(() => import("./features/profile/Profile"));

const SkeletonHome = () => (
  <div
    style={{ backgroundColor: "var(--bg)" }}
    className="min-h-screen px-6 py-12 animate-pulse"
  >
    <div className="h-16 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-20 w-full max-w-6xl mx-auto" />
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-4 text-center mt-12">
      <div className="h-12 bg-gray-200 dark:bg-zinc-800 rounded-lg w-2/3" />
      <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-lg w-full pt-4" />
      <div className="h-14 bg-gray-300 dark:bg-zinc-700 rounded-xl w-48 mt-8" />
    </div>
  </div>
);

function App() {
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  return (
    <Suspense fallback={<SkeletonHome />}>
      <div
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
        className="min-h-screen overflow-x-hidden transition-colors duration-300"
      >
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
                className="min-h-screen overflow-x-hidden transition-colors duration-300"
              >
                <NavBar />
                {/* Hero Section */}
                <section className="flex flex-col items-center justify-center text-center mt-20 md:mt-28 px-4 md:px-6 max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-bold text-blue-500 dark:text-blue-400 mb-4 md:mb-5 tracking-tight">
                    CodeQuest
                  </h1>

                  <h2
                    className="text-2xl md:text-4xl font-extrabold mb-5 bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent px-2"
                    style={{ color: "var(--text-h)" }}
                  >
                    I Code, I Think, I Conquer
                  </h2>

                  <p
                    className="max-w-2xl mb-8 md:mb-10 text-base md:text-lg leading-relaxed px-2"
                    style={{ color: "var(--text-h)" }}
                  >
                    Đập tan tư duy lối mòn "Copy-Paste". Khai phóng bản năng
                    giải quyết vấn đề của một Kỹ sư Phần mềm thực thụ.
                  </p>

                  <Button
                    variant="primary"
                    size="xlg"
                    to={isLoggedIn ? "/assessment" : "/login"}
                    className="w-full sm:w-auto"
                  >
                    Đánh giá năng lực ngay
                  </Button>
                </section>

                {/* giữ nguyên Features Section phía dưới */}
                <section className="grid md:grid-cols-3 gap-8 px-10 mt-28 pb-20 max-w-6xl mx-auto">
                  {/* Feature 1 */}
                  <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800/60 hover:border-blue-500/80 transition-all duration-300 shadow-xl group">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                      AI Mind Mirror
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Phân tích chuyên sâu tư duy thuật toán và phong cách giải
                      quyết vấn đề độc quyền của riêng bạn, vượt trội hơn các
                      công cụ chấm điểm thông thường.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800/60 hover:border-blue-500/80 transition-all duration-300 shadow-xl group">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                      Adaptive Roadmap
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Lộ trình học tập cá nhân hóa, tự động tinh chỉnh linh hoạt
                      dựa trên tiến độ thực tế và tốc độ tiếp thu của từng học
                      viên.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800/60 hover:border-blue-500/80 transition-all duration-300 shadow-xl group">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                      Targeted Sandbox
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Trình luyện tập thông minh giúp cô lập và tối ưu hóa các
                      mảng kiến thức còn yếu thông qua hệ thống bài tập thực
                      chiến bổ trợ.
                    </p>
                  </div>
                </section>
              </div>
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/roadmap" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              isLoggedIn ? <Navigate to="/roadmap" replace /> : <SignUp />
            }
          />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Asssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/:challengeId"
            element={
              <ProtectedRoute>
                <Asssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:id"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminLayout />} />

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

          <Route
            path="*"
            element={
              <Navigate to={isLoggedIn ? "/roadmap" : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
