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
              <h1 className="text-6xl font-bold text-blue-400 mb-5">
                CodeQuest
              </h1>

              <h2 className="text-4xl font-semibold mb-4">
                I Code, I Think, I Conquer
              </h2>

              <p className="text-gray-400 max-w-2xl mb-10">
                Think like a Problem Solver, Not a Copy-Paster
              </p>

              <Button variant="primary" size="xlg" to="/assessment">
                Bắt đầu kiểm tra
              </Button>
            </section>

            {/* Features */}
            <section className="grid md:grid-cols-3 gap-8 px-10 mt-28 pb-20">
              <div className="bg-[#111827] p-8 rounded-2xl border-gray-800 hover:border-blue-500 transition">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">
                  AI Thinking Mirror
                </h3>

                <p className="text-gray-400">
                  Get personalized feedback on your coding mindset and
                  problem-solving approach.
                </p>
              </div>

              <div className="bg-[#111827] p-8 rounded-2xl border-gray-800 hover:border-blue-500 transition">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">
                  Dynamic Roadmap
                </h3>

                <p className="text-gray-400">
                  Adaptive roadmap tailored to your level and learning speed.
                </p>
              </div>

              <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">
                  Practice Engine
                </h3>

                <p className="text-gray-400">
                  Reinforce weak areas with smart targeted exercises.
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
    </Routes>
  );
}

export default App;
