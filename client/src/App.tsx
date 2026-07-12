import React, { Suspense, useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router";
import { Button } from "./components/common/Button";
import { NavBar } from "./features/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";

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

function useScrollReveal() {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
        } else {
          setIsRevealed(false);
        }
      },
      { threshold: 0.15 },
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  return { elementRef, isRevealed };
}

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
  const { elementRef, isRevealed } = useScrollReveal();

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
              {/* Navbar */}
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
                  Đập tan tư duy lối mòn "Copy-Paste". Khai phóng bản năng giải
                  quyết vấn đề của một Kỹ sư Phần mềm thực thụ.
                </p>
                <Button
                  variant="primary"
                  size="xlg"
                  to="/login"
                  className="w-full sm:w-auto"
                >
                  Đánh giá năng lực ngay
                </Button>
              </section>

              {/* Features Section*/}
              <section
                ref={elementRef}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-6 md:px-10 mt-20 md:mt-28 pb-20 max-w-6xl mx-auto"
              >
                {/* Feature 1 */}
                <div
                  className={`p-6 md:p-8 rounded-2xl border hover:border-blue-400 dark:hover:border-blue-500/80 transition-all duration-300 shadow-xl group
                    ${isRevealed ? "reveal-visible animate-float-slow" : "reveal-hidden"}`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border)",
                    animationDelay: isRevealed ? "0ms, 800ms" : "0ms",
                  }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    AI Mind Mirror
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-h)" }}
                  >
                    Phân tích chuyên sâu tư duy thuật toán và phong cách giải
                    quyết vấn đề độc quyền của riêng bạn, vượt trội hơn các công
                    cụ chấm điểm thông thường.
                  </p>
                </div>

                {/* Feature 2 */}
                <div
                  className={`p-6 md:p-8 rounded-2xl border hover:border-blue-400 dark:hover:border-blue-500/80 transition-all duration-300 shadow-xl group
                    ${isRevealed ? "reveal-visible animate-float-medium" : "reveal-hidden"}`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border)",
                    animationDelay: isRevealed ? "150ms, 950ms" : "0ms",
                  }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    Adaptive Roadmap
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-h)" }}
                  >
                    Lộ trình học tập cá nhân hóa, tự động tinh chỉnh linh hoạt
                    dựa trên tiến độ thực tế và tốc độ tiếp thu của từng học
                    viên.
                  </p>
                </div>

                {/* Feature 3 */}
                <div
                  className={`p-6 md:p-8 rounded-2xl border hover:border-blue-400 dark:hover:border-blue-500/80 transition-all duration-300 shadow-xl group
                    ${isRevealed ? "reveal-visible animate-float-fast" : "reveal-hidden"}`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border)",
                    animationDelay: isRevealed ? "300ms, 1100ms" : "0ms",
                  }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    Targeted Sandbox
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-h)" }}
                  >
                    Trình luyện tập thông minh giúp cô lập và tối ưu hóa các
                    mảng kiến thức còn yếu thông qua hệ thống bài tập thực chiến
                    bổ trợ.
                  </p>
                </div>
              </section>
            </div>
          }
        />
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoadmapPage />
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
      </div>
    </Suspense>
  );
}

export default App;
