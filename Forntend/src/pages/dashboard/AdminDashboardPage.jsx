import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Calendar,
  BarChart3,
  Clock,
  Lock,
  Zap,
} from "lucide-react";
import { dashboardAPI } from "../../api/dashboard.api";
import { PriorityBadge } from "../../components/common/Badge";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import DashboardMetricDetailsModal from "../../components/dashboard/DashboardMetricDetailsModal";
import ScrollReveal from "../../components/common/ScrollReveal";
import ScrollSpyNav from "../../components/common/ScrollSpyNav";
import ScrollHorizontalShadow from "../../components/common/ScrollHorizontalShadow";
import {
  TaskStatusDoughnut,
  TaskPriorityBarChart,
  MemberWorkloadBarChart,
} from "../../components/charts/DashboardCharts";

export const AdminDashboardPage = () => {
  const [liveSummary, setLiveSummary] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [activeMetric, setActiveMetric] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const refreshSummary = useCallback(async () => {
    try {
      const [sumRes, workRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getMemberWorkload(),
      ]);
      setLiveSummary(sumRes.data.data);
      setWorkload(workRes.data.data?.workload || []);
    } catch (err) {
      console.warn("Live admin summary failed:", err);
    }
  }, []);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  const closeMetricDetails = useCallback(() => setActiveMetric(null), []);
  const closeTaskDetails = useCallback(() => setDetailsOpen(false), []);

  const taskStats = liveSummary?.tasks || {};
  const userStats = liveSummary?.userStats || {};
  const upcomingTasks = liveSummary?.upcomingTasks || [];

  const spyItems = [
    { id: "admin-overview", label: "Executive Overview", icon: ShieldCheck },
    { id: "admin-stats", label: "Platform Metrics", icon: Layers },
    { id: "admin-telemetry", label: "Telemetry Metrics", icon: Activity },
    ...(upcomingTasks.length > 0
      ? [{ id: "admin-upcoming", label: "Sprint Deadlines", icon: Calendar }]
      : []),
  ];

  return (
    <div className="dashboard-content-page animate-fade-in admin-scroll-experience">
      {/* Floating Executive HUD Quick-Jump ScrollSpy Navigator */}
      <ScrollSpyNav items={spyItems} className="mb-2" />

      {/* 1. Header Section */}
      <section id="admin-overview" className="scroll-anchor-section">
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="page-header">
            <div className="flex-between">
              <div>
                <div className="executive-badge-pill">
                  <span className="live-pulse-dot" />
                  <span>Real-time Workspace Governance</span>
                </div>
                <h1 className="page-title">Executive Command Center</h1>
                <p className="page-subtitle">
                  Organization-wide workspace telemetry, staffing governance, and
                  sprint delivery health
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 2. Platform Metrics Stat Cards */}
      <section id="admin-stats" className="scroll-anchor-section">
        <div className="grid-metrics-4 mb-4">
          <ScrollReveal variant="fade-up" delay={0} duration={500}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-indigo"
              onClick={() => setActiveMetric("adminProjects")}
              aria-haspopup="dialog"
              aria-label="View total projects"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Total Projects</span>
                <div className="metric-icon-box bg-indigo-subtle">
                  <FolderKanban size={20} className="text-indigo-600" />
                </div>
              </div>
              <div className="metric-stat-number">
                {liveSummary?.totalProjects ?? "—"}
              </div>
              <div className="metric-stat-meta">
                <span>Enterprise workspace initiatives</span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={60} duration={500}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-purple"
              onClick={() => setActiveMetric("adminUsers")}
              aria-haspopup="dialog"
              aria-label="View platform users"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Platform Users</span>
                <div className="metric-icon-box bg-purple-subtle">
                  <Users size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="metric-stat-number">{userStats.totalUsers ?? "—"}</div>
              <div className="metric-stat-meta">
                <span>
                  {userStats.activeUsers ?? "—"} active accounts
                </span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={120} duration={500}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-emerald"
              onClick={() => setActiveMetric("adminTasks")}
              aria-haspopup="dialog"
              aria-label="View total tasks"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Total Tasks</span>
                <div className="metric-icon-box bg-emerald-subtle">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
              </div>
              <div className="metric-stat-number">{taskStats.totalTasks ?? "—"}</div>
              <div className="metric-stat-meta">
                <span>{taskStats.completedTasks ?? "—"} deliverables done</span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={180} duration={500}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-rose"
              onClick={() => setActiveMetric("adminOverdue")}
              aria-haspopup="dialog"
              aria-label="View overdue tasks"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Overdue Tasks</span>
                <div className="metric-icon-box bg-rose-subtle">
                  <AlertCircle size={20} className="text-rose-600" />
                </div>
              </div>
              <div className="metric-stat-number">
                {taskStats.overdueTasks ?? "—"}
              </div>
              <div className="metric-stat-meta">
                <span>Requires sprint remediation</span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. Live Workspace Telemetry & Visual Analytics Section */}
      <section id="admin-telemetry" className="scroll-anchor-section mb-4">
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="dashboard-panel shadow-elevated mb-4">
            <div className="panel-header">
              <div className="flex-align-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                <h3 className="panel-title">Workspace Telemetry & Analytics</h3>
              </div>
              <span className="panel-badge bg-indigo-subtle text-indigo-700">
                Live Engine
              </span>
            </div>
            <div className="panel-body">
              {/* Telemetry Status Strip */}
              <div className="telemetry-inner mb-4" style={{ padding: "16px", borderRadius: "12px" }}>
                <div className="telemetry-stat">
                  <div className="telemetry-icon-box bg-blue-subtle text-blue-600">
                    <Zap size={18} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-value">99.98%</span>
                    <span className="telemetry-label">SLA Uptime</span>
                  </div>
                </div>
                <div className="telemetry-stat">
                  <div className="telemetry-icon-box bg-emerald-subtle text-emerald-600">
                    <Clock size={18} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-value">15 min</span>
                    <span className="telemetry-label">Token Cycle</span>
                  </div>
                </div>
                <div className="telemetry-stat">
                  <div className="telemetry-icon-box bg-purple-subtle text-purple-600">
                    <Lock size={18} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-value">RBAC</span>
                    <span className="telemetry-label">Role Isolation</span>
                  </div>
                </div>
                <div className="telemetry-stat">
                  <div className="telemetry-icon-box bg-amber-subtle text-amber-600">
                    <BarChart3 size={18} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-value">{taskStats.totalTasks || 0}</span>
                    <span className="telemetry-label">Tracked Items</span>
                  </div>
                </div>
              </div>

              {/* Telemetry Visual Charts Grid */}
              <div className="charts-grid-2">
                <div className="dashboard-panel p-4" style={{ background: "#ffffff", border: "1px solid var(--border-light)" }}>
                  <h4 className="font-bold text-sm mb-3 flex-align-center gap-2">
                    <span className="status-dot dot-in-progress" />
                    <span>Task Status Telemetry</span>
                  </h4>
                  <TaskStatusDoughnut data={taskStats} />
                </div>

                <div className="dashboard-panel p-4" style={{ background: "#ffffff", border: "1px solid var(--border-light)" }}>
                  <h4 className="font-bold text-sm mb-3 flex-align-center gap-2">
                    <span className="status-dot dot-todo" />
                    <span>Priority Distribution</span>
                  </h4>
                  <TaskPriorityBarChart data={taskStats} />
                </div>
              </div>

              {/* Team Workload Allocation Chart */}
              {workload.length > 0 && (
                <div className="dashboard-panel p-4 mt-4" style={{ background: "#ffffff", border: "1px solid var(--border-light)" }}>
                  <h4 className="font-bold text-sm mb-3 flex-align-center gap-2">
                    <Users size={16} className="text-indigo-600" />
                    <span>Team Workload & Capacity Telemetry</span>
                  </h4>
                  <MemberWorkloadBarChart workload={workload} />
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <DashboardMetricDetailsModal
        isOpen={Boolean(activeMetric)}
        onClose={closeMetricDetails}
        metric={activeMetric}
        onTaskUpdated={refreshSummary}
      />

      {/* 4. Upcoming Deliverables Widget with Horizontal Shadow Container */}
      {upcomingTasks.length > 0 && (
        <section id="admin-upcoming" className="scroll-anchor-section">
          <ScrollReveal variant="fade-up" delay={80} duration={500}>
            <div className="dashboard-panel mb-4 shadow-elevated">
              <div className="panel-header">
                <div className="flex-align-center gap-2">
                  <h3 className="panel-title">Upcoming Sprint Deadlines</h3>
                  <span className="panel-badge">Next 7 Days</span>
                </div>
                <span className="text-xs text-muted">Click row for task details</span>
              </div>
              <div className="panel-body p-0">
                <ScrollHorizontalShadow>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Deliverable</th>
                        <th>Project</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingTasks.map((t, idx) => (
                        <tr
                          key={t._id}
                          className="cursor-pointer table-row-animated"
                          style={{ animationDelay: `${(idx % 10) * 30}ms` }}
                          onClick={() => {
                            setSelectedTaskId(t._id);
                            setDetailsOpen(true);
                          }}
                        >
                          <td>
                            <span className="font-semibold text-sm hover-underline">
                              {t.title}
                            </span>
                          </td>
                          <td>{t.project?.name || "Project"}</td>
                          <td>
                            <PriorityBadge priority={t.priority} />
                          </td>
                          <td>{t.assignee?.name || "Unassigned"}</td>
                          <td>
                            <span className="text-xs font-semibold text-indigo-600">
                              {new Date(t.dueDate).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollHorizontalShadow>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      <TaskDetailsModal
        isOpen={detailsOpen}
        onClose={closeTaskDetails}
        taskId={selectedTaskId}
        onTaskUpdated={refreshSummary}
      />
    </div>
  );
};

export default AdminDashboardPage;
