import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layouts & Protected Routes
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/routes/ProtectedRoute";

// Auth Pages
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import ManagerLoginPage from "./pages/auth/ManagerLoginPage";
import MemberLoginPage from "./pages/auth/MemberLoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboards
import AdminDashboardPage from "./pages/dashboard/AdminDashboardPage";
import ManagerDashboardPage from "./pages/dashboard/ManagerDashboardPage";
import MemberDashboardPage from "./pages/dashboard/MemberDashboardPage";

// Modules
import UserManagementPage from "./pages/users/UserManagementPage";
import ProjectListPage from "./pages/projects/ProjectListPage";
import ProjectDetailsPage from "./pages/projects/ProjectDetailsPage";
import TasksPage from "./pages/tasks/TasksPage";
import ProfilePage from "./pages/profile/ProfilePage";

// Misc Pages
import LandingPage from "./pages/misc/LandingPage";
import NotFoundPage from "./pages/misc/NotFoundPage";
import UnauthorizedPage from "./pages/misc/UnauthorizedPage";

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/login/manager" element={<ManagerLoginPage />} />
          <Route path="/login/member" element={<MemberLoginPage />} />
          <Route
            path="/login"
            element={<Navigate to="/login/member" replace />}
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Authenticated Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboardPage />}
                />
                <Route path="/admin/users" element={<UserManagementPage />} />
              </Route>

              {/* Manager Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
                <Route
                  path="/manager/dashboard"
                  element={<ManagerDashboardPage />}
                />
              </Route>

              {/* Member Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
                <Route
                  path="/member/dashboard"
                  element={<MemberDashboardPage />}
                />
              </Route>

              {/* Shared Multi-Role Routes */}
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
