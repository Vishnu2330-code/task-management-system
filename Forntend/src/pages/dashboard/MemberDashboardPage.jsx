import React, { useState, useEffect, useCallback } from "react";
import { dashboardAPI } from "../../api/dashboard.api";
import { taskAPI } from "../../api/task.api";
import { useAuth } from "../../context/AuthContext";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "../../components/common/Badge";
import { CardSkeleton } from "../../components/common/Skeleton";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import DashboardMetricDetailsModal from "../../components/dashboard/DashboardMetricDetailsModal";
import ScrollReveal from "../../components/common/ScrollReveal";
import ScrollHorizontalShadow from "../../components/common/ScrollHorizontalShadow";

export const MemberDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchMemberData = async () => {
    try {
      const [summaryRes, tasksRes] = await Promise.all([
        dashboardAPI.getSummary(),
        taskAPI.getTasks({
          assignee: user._id,
          limit: 15,
          sortBy: "dueDate",
          order: "asc",
        }),
      ]);
      setData(summaryRes.data.data);
      setMyTasks(tasksRes.data.data || []);
    } catch (err) {
      console.error("Failed to load member metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      fetchMemberData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const closeMetricDetails = useCallback(() => setActiveMetric(null), []);
  const closeTaskDetails = useCallback(() => setDetailsOpen(false), []);

  if (loading) {
    return (
      <div className="dashboard-content-page">
        <div className="page-header">
          <h1 className="page-title">Personal Workspace Overview</h1>
        </div>
        <div className="grid-metrics-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const { myTasksStats = {} } = data || {};

  return (
    <div className="dashboard-content-page animate-fade-in member-scroll-experience">
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div className="member-badge-pill">
                <Sparkles size={14} className="text-emerald-500" />
                <span>Personal Sprint Horizon</span>
              </div>
              <h1 className="page-title">
                Welcome back, {user?.name?.split(" ")[0]}
              </h1>
              <p className="page-subtitle">
                Here is a snapshot of your current sprint deliverables, priorities, and
                deadlines
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Member Key Metrics with Staggered Scroll Entrance */}
      <div className="grid-metrics-4">
        <ScrollReveal variant="fade-up" delay={0} duration={550}>
          <button
            type="button"
            className="metric-stat-card metric-stat-card-button card-emerald"
            onClick={() => setActiveMetric("memberAssigned")}
            aria-haspopup="dialog"
            aria-label="View assigned deliverables"
          >
            <div className="metric-card-top">
              <span className="metric-stat-label">Assigned Deliverables</span>
              <div className="metric-icon-box bg-emerald-subtle">
                <CheckSquare size={20} className="text-emerald-600" />
              </div>
            </div>
            <div className="metric-stat-number">{myTasksStats.total ?? 0}</div>
            <div className="metric-stat-meta">
              <span>Total tasks assigned to you</span>
              <ArrowRight size={15} className="metric-card-arrow" />
            </div>
          </button>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={80} duration={550}>
          <button
            type="button"
            className="metric-stat-card metric-stat-card-button card-indigo"
            onClick={() => setActiveMetric("memberInProgress")}
            aria-haspopup="dialog"
            aria-label="View tasks in progress"
          >
            <div className="metric-card-top">
              <span className="metric-stat-label">In Progress</span>
              <div className="metric-icon-box bg-indigo-subtle">
                <Clock size={20} className="text-indigo-600" />
              </div>
            </div>
            <div className="metric-stat-number">
              {myTasksStats.inProgress ?? 0}
            </div>
            <div className="metric-stat-meta">
              <span>Tasks underway</span>
              <ArrowRight size={15} className="metric-card-arrow" />
            </div>
          </button>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={160} duration={550}>
          <button
            type="button"
            className="metric-stat-card metric-stat-card-button card-purple"
            onClick={() => setActiveMetric("memberCompleted")}
            aria-haspopup="dialog"
            aria-label="View completed tasks"
          >
            <div className="metric-card-top">
              <span className="metric-stat-label">Completed</span>
              <div className="metric-icon-box bg-purple-subtle">
                <CheckCircle2 size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="metric-stat-number text-success">
              {myTasksStats.done ?? 0}
            </div>
            <div className="metric-stat-meta">
              <span>Successfully shipped</span>
              <ArrowRight size={15} className="metric-card-arrow" />
            </div>
          </button>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={240} duration={550}>
          <button
            type="button"
            className="metric-stat-card metric-stat-card-button card-rose"
            onClick={() => setActiveMetric("memberOverdue")}
            aria-haspopup="dialog"
            aria-label="View overdue tasks"
          >
            <div className="metric-card-top">
              <span className="metric-stat-label">Overdue</span>
              <div className="metric-icon-box bg-rose-subtle">
                <AlertCircle size={20} className="text-rose-600" />
              </div>
            </div>
            <div
              className={`metric-stat-number ${myTasksStats.overdue > 0 ? "text-danger" : ""}`}
            >
              {myTasksStats.overdue ?? 0}
            </div>
            <div className="metric-stat-meta">
              <span>Requires urgent completion</span>
              <ArrowRight size={15} className="metric-card-arrow" />
            </div>
          </button>
        </ScrollReveal>
      </div>

      <DashboardMetricDetailsModal
        isOpen={Boolean(activeMetric)}
        onClose={closeMetricDetails}
        metric={activeMetric}
        userId={user?._id}
        onTaskUpdated={fetchMemberData}
      />

      {/* Assigned Tasks Table with Scroll Horizontal Shadow */}
      <ScrollReveal variant="fade-up" delay={120} duration={600}>
        <div className="dashboard-panel mt-4 shadow-elevated">
          <div className="panel-header">
            <div className="flex-between w-full">
              <div className="flex-align-center gap-2">
                <CheckSquare size={18} className="text-emerald-600" />
                <h3 className="panel-title">My Assigned Sprint Tasks</h3>
              </div>
              <span className="text-xs text-muted">
                {myTasks.length} active items
              </span>
            </div>
          </div>
          <div className="panel-body p-0">
            {myTasks.length === 0 ? (
              <div className="empty-panel-body py-8 text-center">
                <CheckSquare size={32} className="text-muted mb-2 mx-auto" />
                <p className="font-semibold text-sm">All caught up!</p>
                <p className="text-xs text-muted">
                  You have no pending assigned deliverables.
                </p>
              </div>
            ) : (
              <ScrollHorizontalShadow>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Deliverable</th>
                      <th>Project</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.map((t, idx) => {
                      const isOverdue =
                        t.dueDate &&
                        t.status !== "done" &&
                        new Date(t.dueDate) < new Date();

                      return (
                        <tr
                          key={t._id}
                          className="cursor-pointer table-row-animated"
                          style={{ animationDelay: `${idx * 35}ms` }}
                        >
                          <td
                            onClick={() => {
                              setSelectedTaskId(t._id);
                              setDetailsOpen(true);
                            }}
                          >
                            <span className="font-semibold text-sm hover-underline">
                              {t.title}
                            </span>
                          </td>
                          <td>{t.project?.name || "Project"}</td>
                          <td>
                            <PriorityBadge priority={t.priority} />
                          </td>
                          <td
                            className={
                              isOverdue ? "text-danger font-semibold" : ""
                            }
                          >
                            {t.dueDate ? (
                              <div className="flex-align-center gap-1">
                                <Calendar size={13} />
                                <span>
                                  {new Date(t.dueDate).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted">None</span>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={t.status} />
                          </td>
                          <td>
                            <select
                              className="status-dropdown-sm"
                              value={t.status}
                              onChange={(e) =>
                                handleQuickStatusChange(t._id, e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollHorizontalShadow>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={detailsOpen}
        onClose={closeTaskDetails}
        taskId={selectedTaskId}
        onTaskUpdated={fetchMemberData}
      />
    </div>
  );
};

export default MemberDashboardPage;
