import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  avatar?: string;
  role?: "user" | "admin" | string;
  currentLevel?: string;
  xpTotal?: number;
}

interface AuthState {
  user: UserInfo | null;
  isLoggedIn: boolean;
}

const storedUser =
  typeof window !== "undefined" ? localStorage.getItem("user") : null;

const storedAccessToken =
  typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

function parseStoredUser(value: string | null): UserInfo | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as UserInfo;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

const initialState: AuthState = {
  user: parseStoredUser(storedUser),
  isLoggedIn: Boolean(storedAccessToken),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.user;
export const selectIsLoggedIn = (state: any) => state.auth.isLoggedIn;
