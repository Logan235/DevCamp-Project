import React from "react";
import { NavBar } from "../../NavBar";
import { useAuth } from "../../auth/hooks";

export const DashboardHeader: React.FC = () => {
  const { isLoggedIn, displayName, avatarUrl } = useAuth();
  return (
    <NavBar
      isLoggedIn={isLoggedIn}
      userAvatar={avatarUrl}
      userName={displayName}
    />
  );
};
