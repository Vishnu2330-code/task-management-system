import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { taskAPI } from "../../api/task.api";
import { projectAPI } from "../../api/project.api";
import { userAPI } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderGit2,
  Sparkles,
} from "lucide-react";
import TaskModal from "../../components/tasks/TaskModal";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { PriorityBadge, StatusBadge } from "../../components/common/Badge";
import ScrollReveal from "../../components/common/ScrollReveal";
import ScrollHorizontalShadow from "../../components/common/ScrollHorizontalShadow";

export const TasksPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const myTasksParam = searchParams.get("myTasks") === "true";

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const onlyMyTasks = myTasksParam;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(true);

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalStatus, setTaskModalStatus] = useState("todo");
  const [editingTask, setEditingTask] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(null);

  const canCreate = user?.role === "admin" || user?.role === "manager";

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        ...(selectedProjectId && { project: selectedProjectId }),
        ...(onlyMyTasks && { myTasks: true }),
      };
      const { data } = await taskAPI.getTasks(params);
      setTasks(data.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, onlyMyTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    // Load projects and members for dropdowns
    projectAPI
      .getProjects({ limit: 50 })
      .then((res) => {
        const projectList = res.data.data || [];
        setProjects(projectList);
      })
      .catch(() => {});

    userAPI
      .getProjectMembers()
      .then((res) => setMembers(res.data.data.members || []))
      .catch(() => {});
  }, []);

  const handleDeleteTask = async () => {
    if (!deleteTaskConfirm) return;
    try {
      await taskAPI.deleteTask(deleteTaskConfirm._id);
      setDeleteTaskConfirm(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  // Filter tasks for table view
  const filteredTableTasks = tasks
    .filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.labels?.some((l) => l.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (assigneeFilter === "unassigned" && t.assignee) return false;
      if (
        assigneeFilter &&
        assigneeFilter !== "unassigned" &&
        t.assignee?._id !== assigneeFilter
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "priority") {
        const weights = { high: 3, med: 2, low: 1 };
        return (weights[b.priority] || 0) - (weights[a.priority] || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const activeProjectName =
    projects.find((p) => p._id === selectedProjectId)?.name || "All Projects";

  return (
    <div className="dashboard-content-page animate-fade-in tasks-scroll-experience">
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div className="tasks-badge-pill">
                <Sparkles size={14} className="text-amber-600" />
                <span>Sprint Task Workstation</span>
              </div>
              <h1 className="page-title">{activeProjectName} Tasks</h1>
              <p className="page-subtitle">
                Manage, prioritize, and track sprint deliverables and assignments across all workspaces
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Global Filter & Action Controls Bar with Scroll-Sticky Elevation */}
      <div className="table-controls-bar sticky-table-controls">
        <div className="search-input-wrapper" style={{ maxWidth: "340px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title, label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          {/* Project Filter */}
          <select
            className="filter-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Completed</option>
          </select>

          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="med">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="filter-select"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            {user?.role !== "admin" && (
              <option value="unassigned">Unassigned</option>
            )}
            {members
              .filter(
                (member) =>
                  user?.role !== "admin" || member.role !== "admin",
              )
              .map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Sort: Created Date</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Highest Priority</option>
          </select>

          {canCreate && selectedProjectId && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingTask(null);
                setTaskModalStatus("todo");
                setTaskModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Refreshing deliverables..." />
      ) : filteredTableTasks.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No tasks match filter"
          description="Try adjusting your project selection, search query, or status filters."
        />
      ) : (
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="dashboard-panel p-0 shadow-elevated">
            <ScrollHorizontalShadow>
              <table className="data-table sticky-header-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableTasks.map((t, idx) => (
                    <tr
                      key={t._id}
                      className="cursor-pointer table-row-animated"
                      style={{ animationDelay: `${(idx % 15) * 25}ms` }}
                      onClick={() => {
                        setSelectedTaskId(t._id);
                        setDetailsModalOpen(true);
                      }}
                    >
                      <td>
                        <span className="font-semibold text-sm hover-underline">
                          {t.title}
                        </span>
                        {t.labels && t.labels.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {t.labels.slice(0, 3).map((l, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "#f1f5f9",
                                  color: "#64748b",
                                }}
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{t.project?.name || "Project"}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex-align-center gap-2">
                          <StatusBadge status={t.status} />
                        </div>
                      </td>
                      <td>
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td>{t.assignee?.name || "Unassigned"}</td>
                      <td>
                        {t.dueDate ? (
                          <span className="text-xs">
                            {new Date(t.dueDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-muted text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollHorizontalShadow>
          </div>
        </ScrollReveal>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={editingTask}
        projectId={selectedProjectId || projects[0]?._id}
        projects={projects}
        members={members}
        initialStatus={taskModalStatus}
        onTaskSaved={fetchTasks}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        taskId={selectedTaskId}
        onEditTask={(t) => {
          setEditingTask(t);
          setTaskModalOpen(true);
        }}
        onDeleteTask={(t) => setDeleteTaskConfirm(t)}
        onTaskUpdated={fetchTasks}
      />

      {/* Confirm Task Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTaskConfirm}
        onClose={() => setDeleteTaskConfirm(null)}
        onConfirm={handleDeleteTask}
        title="Delete Deliverable"
        message={`Are you sure you want to permanently delete "${deleteTaskConfirm?.title}"?`}
        confirmText="Delete Task"
        danger={true}
      />
    </div>
  );
};

export default TasksPage;
