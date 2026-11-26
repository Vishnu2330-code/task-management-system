import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Target,
  Zap,
} from "lucide-react";
import { dashboardAPI } from "../../api/dashboard.api";
import DashboardMetricDetailsModal from "../../components/dashboard/DashboardMetricDetailsModal";
import ScrollReveal from "../../components/common/ScrollReveal";
import ScrollSpyNav from "../../components/common/ScrollSpyNav";
import { useInView } from "../../hooks/useScrollAnimations";
import {
  TaskStatusDoughnut,
  TaskPriorityBarChart,
} from "../../components/charts/DashboardCharts";

export const ManagerDashboardPage = () => {
  const [liveSummary, setLiveSummary] = useState(null);
  const [activeMetric, setActiveMetric] = useState(null);

  useEffect(() => {
    dashboardAPI
      .getSummary()
      .then((res) => setLiveSummary(res.data.data))
      .catch((err) => console.warn("Live manager summary failed:", err));
  }, []);

  const taskStats = liveSummary?.tasks || {};

  const closeMetricDetails = useCallback(() => setActiveMetric(null), []);

  const refreshSummary = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      setLiveSummary(res.data.data);
    } catch (err) {
      console.warn("Live manager summary failed:", err);
    }
  };

  const totalTasks = taskStats.totalTasks || 0;
  const completedTasks = taskStats.completedTasks || 0;
  const inProgressTasks = taskStats.inProgressTasks || 0;
  const overdueTasks = taskStats.overdueTasks || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressRate =
    totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

  // Velocity In-View Trigger
  const [velocityRef, isVelocityInView] = useInView({ threshold: 0.2 });

  const spyItems = [
    { id: "manager-overview", label: "Sprint Overview", icon: Briefcase },
    { id: "manager-metrics", label: "Delivery Metrics", icon: Target },
    { id: "manager-velocity", label: "Sprint Velocity", icon: TrendingUp },
  ];

  return (
    <div className="dashboard-content-page animate-fade-in manager-scroll-experience">
      {/* Quick-Jump Section Navigator */}
      <ScrollSpyNav items={spyItems} className="mb-2" />

      {/* Overview Section */}
      <section id="manager-overview" className="scroll-anchor-section">
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="page-header">
            <div className="flex-between">
              <div>
                <div className="manager-badge-pill">
                  <Zap size={14} className="text-purple-500" />
                  <span>Sprint Velocity & Agile Delivery Control</span>
                </div>
                <h1 className="page-title">Engineering Sprint Command</h1>
                <p className="page-subtitle">
                  Sprint deliverables, team accountability, and cross-department
                  delivery health
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Live Sprint Metrics with Staggered Scroll Entrance */}
      <section id="manager-metrics" className="scroll-anchor-section">
        <div className="grid-metrics-4 mb-4">
          <ScrollReveal variant="fade-up" delay={0} duration={550}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-indigo"
              onClick={() => setActiveMetric("managerProjects")}
              aria-haspopup="dialog"
              aria-label="View active projects"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Active Projects</span>
                <div className="metric-icon-box bg-indigo-subtle">
                  <FolderKanban size={20} className="text-indigo-600" />
                </div>
              </div>
              <div className="metric-stat-number">
                {liveSummary?.totalProjects ?? "—"}
              </div>
              <div className="metric-stat-meta">
                <span>Sprint repositories assigned</span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={80} duration={550}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-purple"
              onClick={() => setActiveMetric("managerTasks")}
              aria-haspopup="dialog"
              aria-label="View sprint tasks"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Sprint Tasks</span>
                <div className="metric-icon-box bg-purple-subtle">
                  <CheckCircle2 size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="metric-stat-number">{taskStats.totalTasks ?? "—"}</div>
              <div className="metric-stat-meta">
                <span>
                  {taskStats.inProgressTasks ?? "—"} currently in progress
                </span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={160} duration={550}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-emerald"
              onClick={() => setActiveMetric("managerCompleted")}
              aria-haspopup="dialog"
              aria-label="View completed deliverables"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Completed</span>
                <div className="metric-icon-box bg-emerald-subtle">
                  <Sparkles size={20} className="text-emerald-600" />
                </div>
              </div>
              <div className="metric-stat-number">
                {taskStats.completedTasks ?? "—"}
              </div>
              <div className="metric-stat-meta">
                <span>Verified sprint milestones</span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={240} duration={550}>
            <button
              type="button"
              className="metric-stat-card metric-stat-card-button card-rose"
              onClick={() => setActiveMetric("managerOverdue")}
              aria-haspopup="dialog"
              aria-label="View overdue deliverables"
            >
              <div className="metric-card-top">
                <span className="metric-stat-label">Overdue Deliverables</span>
                <div className="metric-icon-box bg-rose-subtle">
                  <AlertCircle size={20} className="text-rose-600" />
                </div>
              </div>
              <div className="metric-stat-number">
                {taskStats.overdueTasks ?? "—"}
              </div>
              <div className="metric-stat-meta">
                <span>Past deadline date</span>
                <ArrowRight size={15} className="metric-card-arrow" />
              </div>
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Scroll-Triggered Animated Velocity & Delivery Progress Section */}
      <section id="manager-velocity" className="scroll-anchor-section" ref={velocityRef}>
        <ScrollReveal variant="fade-up" delay={100} duration={600}>
          <div className="dashboard-panel mb-4 shadow-elevated">
            <div className="panel-header">
              <div className="flex-align-center gap-2">
                <TrendingUp size={18} className="text-purple-600" />
                <h3 className="panel-title">Sprint Delivery Velocity & Capacity</h3>
              </div>
              <span className="panel-badge bg-purple-subtle text-purple-700">
                Live Telemetry
              </span>
            </div>
            <div className="panel-body">
              <div className="velocity-grid">
                {/* Completion Progress Bar */}
                <div className="velocity-item">
                  <div className="velocity-header">
                    <span className="velocity-title">Milestone Completion Rate</span>
                    <span className="velocity-pct font-bold text-emerald-600">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="velocity-bar-track">
                    <div
                      className="velocity-bar-fill fill-emerald"
                      style={{
                        width: isVelocityInView ? `${completionRate}%` : "0%",
                        transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />
                  </div>
                  <span className="velocity-subtext">
                    {completedTasks} of {totalTasks} deliverables completed
                  </span>
                </div>

                {/* In Progress Bar */}
                <div className="velocity-item">
                  <div className="velocity-header">
                    <span className="velocity-title">Active Sprint Workload</span>
                    <span className="velocity-pct font-bold text-indigo-600">
                      {inProgressRate}%
                    </span>
                  </div>
                  <div className="velocity-bar-track">
                    <div
                      className="velocity-bar-fill fill-indigo"
                      style={{
                        width: isVelocityInView ? `${inProgressRate}%` : "0%",
                        transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
                      }}
                    />
                  </div>
                  <span className="velocity-subtext">
                    {inProgressTasks} tasks currently in active development
                  </span>
                </div>
              </div>

              {/* Sprint Visual Charts */}
              <div className="charts-grid-2 mt-4">
                <div className="dashboard-panel p-4" style={{ background: "#ffffff", border: "1px solid var(--border-light)" }}>
                  <h4 className="font-bold text-sm mb-3 flex-align-center gap-2">
                    <span className="status-dot dot-in-progress" />
                    <span>Sprint Status Telemetry</span>
                  </h4>
                  <TaskStatusDoughnut data={taskStats} />
                </div>

                <div className="dashboard-panel p-4" style={{ background: "#ffffff", border: "1px solid var(--border-light)" }}>
                  <h4 className="font-bold text-sm mb-3 flex-align-center gap-2">
                    <span className="status-dot dot-todo" />
                    <span>Sprint Priority Distribution</span>
                  </h4>
                  <TaskPriorityBarChart data={taskStats} />
                </div>
              </div>
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
    </div>
  );
};

export default ManagerDashboardPage;
