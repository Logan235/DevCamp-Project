import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectIsLoggedIn, logout } from "./slice";

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  return {
    user,
    isLoggedIn,
    displayName: user?.displayName || "Dev",
    avatarUrl: user?.avatarUrl || "/d09df851e636fc7377e7a5fb048706c0.jpg",
    handleLogout,
  };
};
