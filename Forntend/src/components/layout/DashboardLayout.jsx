import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import ScrollProgressBar from '../common/ScrollProgressBar';
import ScrollToTopButton from '../common/ScrollToTopButton';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const currentSection = pathname.startsWith('/admin/users')
    ? 'users'
    : pathname.startsWith('/projects')
      ? 'projects'
      : pathname.startsWith('/tasks')
        ? 'tasks'
        : pathname.startsWith('/profile')
          ? 'profile'
          : 'dashboard';

  return (
    <div className={`dashboard-layout section-${currentSection}`}>
      {/* Top Global Scroll Progress Tracker */}
      <ScrollProgressBar
        colorClass={`progress-${currentSection}`}
        height={3}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main-wrapper">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="dashboard-content-container">
          <Outlet />
        </main>
      </div>

      {/* Floating Radial Progress Scroll-To-Top Button */}
      <ScrollToTopButton threshold={260} label="Back to top" />
    </div>
  );
};

export default DashboardLayout;
