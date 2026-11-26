import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { projectAPI } from "../../api/project.api";
import { taskAPI } from "../../api/task.api";
import { userAPI } from "../../api/user.api";
import { PriorityBadge, RoleBadge, StatusBadge } from "../common/Badge";
import Alert from "../common/Alert";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";
import TaskDetailsModal from "../tasks/TaskDetailsModal";

const DETAILS_PAGE_SIZE = 10;

const metricDefinitions = {
  adminProjects: {
    title: "Total Projects",
    description: "Projects across the organization.",
    emptyMessage: "There are no projects in the workspace.",
    resource: "projects",
  },
  adminUsers: {
    title: "Platform Users",
    description: "User accounts across the organization.",
    emptyMessage: "There are no user accounts.",
    resource: "users",
  },
  adminTasks: {
    title: "Total Tasks",
    description: "Tasks across all projects.",
    emptyMessage: "There are no tasks in the workspace.",
    resource: "tasks",
  },
  adminOverdue: {
    title: "Overdue Tasks",
    description: "Incomplete tasks whose due dates have passed.",
    emptyMessage: "There are no overdue tasks.",
    resource: "tasks",
    overdue: true,
  },
  managerProjects: {
    title: "Active Projects",
    description: "Projects available in your workspace.",
    emptyMessage: "No projects are available in your workspace.",
    resource: "projects",
  },
  managerTasks: {
    title: "Sprint Tasks",
    description: "Tasks across the projects you manage.",
    emptyMessage: "There are no tasks in your workspace yet.",
    resource: "tasks",
  },
  managerCompleted: {
    title: "Completed Deliverables",
    description: "Tasks marked as done across your projects.",
    emptyMessage: "No deliverables have been completed yet.",
    resource: "tasks",
    status: "done",
  },
  managerOverdue: {
    title: "Overdue Deliverables",
    description: "Incomplete tasks whose due dates have passed.",
    emptyMessage: "There are no overdue deliverables.",
    resource: "tasks",
    overdue: true,
  },
  memberAssigned: {
    title: "Assigned Deliverables",
    description: "All tasks currently assigned to you.",
    emptyMessage: "There are no tasks assigned to you.",
    resource: "tasks",
    assigned: true,
  },
  memberInProgress: {
    title: "In Progress",
    description: "Your assigned tasks that are currently underway.",
    emptyMessage: "You have no tasks in progress.",
    resource: "tasks",
    assigned: true,
    status: "in_progress",
  },
  memberCompleted: {
    title: "Completed",
    description: "Your assigned tasks marked as done.",
    emptyMessage: "You have no completed tasks yet.",
    resource: "tasks",
    assigned: true,
    status: "done",
  },
  memberOverdue: {
    title: "Overdue",
    description: "Your incomplete tasks whose due dates have passed.",
    emptyMessage: "You have no overdue tasks.",
    resource: "tasks",
    assigned: true,
    overdue: true,
  },
};

const DashboardMetricDetailsModal = ({
  isOpen,
  metric,
  userId,
  onClose,
  onTaskUpdated,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const requestId = useRef(0);
  const definition = metricDefinitions[metric];

  const loadPage = useCallback(
    async (pageNumber, append = false) => {
      if (!definition) return;

      const currentRequestId = ++requestId.current;
      setLoading(true);
      setError("");

      try {
        let response;
        if (definition.resource === "projects") {
          response = await projectAPI.getProjects({
            page: pageNumber,
            limit: DETAILS_PAGE_SIZE,
          });
        } else if (definition.resource === "users") {
          response = await userAPI.getUsers({
            page: pageNumber,
            limit: DETAILS_PAGE_SIZE,
          });
        } else {
          response = await taskAPI.getTasks({
            page: pageNumber,
            limit: DETAILS_PAGE_SIZE,
            sortBy: "dueDate",
            order: "asc",
            ...(definition.status && { status: definition.status }),
            ...(definition.overdue && { overdue: true }),
            ...(definition.assigned && userId && { assignee: userId }),
          });
        }

        if (currentRequestId !== requestId.current) return;

        const pageItems = response.data.data || [];
        const itemCount = response.data.pagination?.total ?? pageItems.length;
        setItems((current) =>
          append ? [...current, ...pageItems] : pageItems
        );
        setPage(pageNumber);
        setTotal(itemCount);
        setHasMore(pageNumber * DETAILS_PAGE_SIZE < itemCount);
      } catch (requestError) {
        if (currentRequestId !== requestId.current) return;
        setError(
          requestError.response?.data?.message ||
            "Could not load dashboard details."
        );
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false);
        }
      }
    },
    [definition, userId]
  );

  useEffect(() => {
    if (!isOpen || !definition) return undefined;

    setItems([]);
    setPage(1);
    setTotal(0);
    setHasMore(false);
    void loadPage(1);

    return () => {
      requestId.current += 1;
    };
  }, [definition, isOpen, loadPage]);

  const closeTaskDetails = useCallback(
    () => setTaskDetailsOpen(false),
    []
  );

  const openTaskDetails = (taskId) => {
    onClose();
    setSelectedTaskId(taskId);
    setTaskDetailsOpen(true);
  };

  const renderProject = (project) => (
    <Link
      key={project._id}
      to={`/projects/${project._id}`}
      className="metric-detail-row metric-detail-project"
      onClick={onClose}
    >
      <span className="metric-detail-main">
        <strong>{project.name}</strong>
        <span>
          {project.taskMetrics?.totalTasks ?? 0} tasks
          {" | "}
          {project.owner?.name || "No owner assigned"}
        </span>
      </span>
      <span className={`status-pill pill-${project.status}`}>
        {project.status}
      </span>
      <ArrowRight size={17} />
    </Link>
  );

  const renderUser = (user) => (
    <div
      key={user._id}
      className="metric-detail-row metric-detail-user"
    >
      <span className="metric-detail-main">
        <strong>{user.name}</strong>
        <span>
          {user.email}
          {" | "}
          {user.department || "No department"}
        </span>
      </span>
      <RoleBadge role={user.role} />
      <span
        className={`status-pill ${user.isActive ? "pill-active" : "pill-inactive"}`}
      >
        {user.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );

  const renderTask = (task) => (
    <button
      key={task._id}
      type="button"
      className="metric-detail-row metric-detail-task"
      onClick={() => openTaskDetails(task._id)}
    >
      <span className="metric-detail-main">
        <strong>{task.title}</strong>
        <span>
          {task.project?.name || "No project"}
          {" | "}
          {task.assignee?.name || "Unassigned"}
        </span>
      </span>
      <span className="metric-detail-badges">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </span>
      <span className="metric-detail-date">
        <CalendarDays size={14} />
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "No due date"}
      </span>
      <ArrowRight size={17} />
    </button>
  );

  return (
    <>
      <Modal
        isOpen={isOpen && Boolean(definition)}
        onClose={onClose}
        title={definition?.title || ""}
        maxWidth="760px"
      >
        {definition && (
          <div className="metric-details-content">
          <div className="metric-details-summary">
            <p>{definition.description}</p>
            <span>{total} total</span>
          </div>

          {error && <Alert type="error" message={error} />}

          {loading && items.length === 0 ? (
            <LoadingSpinner text="Loading dashboard details..." />
          ) : items.length === 0 && !error ? (
            <div className="metric-details-empty">{definition.emptyMessage}</div>
          ) : (
            <div className="metric-detail-list">
              {items.map((item) => {
                if (definition.resource === "projects") {
                  return renderProject(item);
                }
                if (definition.resource === "users") {
                  return renderUser(item);
                }
                return renderTask(item);
              })}
            </div>
          )}

          {hasMore && (
            <div className="metric-details-more">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={loading}
                onClick={() => void loadPage(page + 1, true)}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
          </div>
        )}
      </Modal>

      <TaskDetailsModal
        isOpen={taskDetailsOpen}
        onClose={closeTaskDetails}
        taskId={selectedTaskId}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  );
};

export default DashboardMetricDetailsModal;
