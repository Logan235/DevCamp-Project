import React from "react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminHeader } from "./AdminHeader";

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050816]">
      <AdminHeader />
      <main style={{ flex: 1 }}>
        <AdminDashboard />
      </main>
    </div>
  );
};
