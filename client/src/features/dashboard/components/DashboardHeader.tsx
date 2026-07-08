import React from "react";
import { useSelector } from "react-redux";
import { NavBar } from "../../NavBar";

export const DashboardHeader: React.FC = () => {
  const { user, isLoggedIn } = useSelector((state: any) => state.auth);
  if (!isLoggedIn || !user) {
    return <NavBar isLoggedIn={false} />;
  }
  const mapLevelToNumber = (levelStr: string): number => {
    switch (levelStr?.toLowerCase()) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "advanced":
        return 3;
      default:
        return 1;
    }
  };

  return (
    <NavBar
      isLoggedIn={true}
      userName={user.displayName || user.email}
      role={user.role}
      currentLevel={mapLevelToNumber(user.currentLevel)}
      xpTotal={user.xpTotal || 0}
      userAvatar={user.avatar}
    />
  );
};
