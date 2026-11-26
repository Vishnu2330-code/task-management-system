import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  FolderGit2,
  Users,
  User,
  CheckSquare,
  ShieldCheck,
  Briefcase,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavLinks = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            to: "/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { to: "/admin/users", label: "Users", icon: Users },
          { to: "/projects", label: "Projects", icon: FolderGit2 },
          { to: "/tasks", label: "Tasks", icon: Kanban },
          { to: "/profile", label: "Profile", icon: User },
        ];
      case "manager":
        return [
          {
            to: "/manager/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { to: "/projects", label: "Projects", icon: FolderGit2 },
          { to: "/tasks", label: "Tasks", icon: Kanban },
          { to: "/profile", label: "Profile", icon: User },
        ];
      case "member":
        return [
          {
            to: "/member/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          { to: "/tasks", label: "Tasks", icon: CheckSquare },
          { to: "/projects", label: "Projects", icon: FolderGit2 },
          { to: "/profile", label: "Profile", icon: User },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Layers size={22} className="brand-logo-svg" />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">TaskFlow</span>
            <span className="brand-tagline">Enterprise OS</span>
          </div>
        </div>

        <div className="sidebar-role-indicator">
          <div className="role-chip">
            {user?.role === "admin" && (
              <ShieldCheck size={14} className="text-indigo-400" />
            )}
            {user?.role === "manager" && (
              <Briefcase size={14} className="text-purple-400" />
            )}
            {user?.role === "member" && (
              <CheckSquare size={14} className="text-emerald-400" />
            )}
            <span className="role-chip-text capitalize">
              {user?.role} Portal
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN WORKSPACE</div>
          <ul className="nav-links-list">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    end={
                      item.to.endsWith("dashboard") || item.to === "/profile"
                    }
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot-pulse" />
            <span className="status-text">Production Ready</span>
          </div>
          <span className="version-tag">v2.4 LTS</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
