import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../api/auth.api";
import { refreshAccessToken } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [loading, setLoading] = useState(true);

  // Initialize session from server on startup
  const initAuth = useCallback(async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      if (data?.data?.user) {
        setUser(data.data.user);
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
    } catch (error) {
      console.warn("Session restoration failed:", error.message);
      // Try refresh token using the shared lock so concurrent requests do not trigger token reuse
      try {
        const refreshRes = await refreshAccessToken();
        const { user: refreshedUser, accessToken } = refreshRes;
        setUser(refreshedUser);
        setToken(accessToken);
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        localStorage.setItem("token", accessToken);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  /**
   * Login user
   */
  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { user: loggedInUser, accessToken } = data.data;

    setUser(loggedInUser);
    setToken(accessToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("token", accessToken);

    return loggedInUser;
  };

  /**
   * Signup new user
   */
  const signup = async (userData) => {
    const { data } = await authAPI.signup(userData);
    return data;
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn("Logout API error:", err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  /**
   * Update Profile details in state
   */
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  /**
   * Get target dashboard path based on role
   */
  const getDashboardPath = (userRole) => {
    const role = userRole || user?.role;
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "manager":
        return "/manager/dashboard";
      case "member":
        return "/member/dashboard";
      default:
        return "/login/member";
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
