import React from "react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminHeader } from "./AdminHeader";

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#050816] text-gray-900 dark:text-white transition-colors">
      <AdminHeader />
      <main style={{ flex: 1 }}>
        <AdminDashboard />
      </main>
    </div>
  );
};
