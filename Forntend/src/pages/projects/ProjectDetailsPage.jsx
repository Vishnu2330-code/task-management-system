import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectAPI } from '../../api/project.api';
import { taskAPI } from '../../api/task.api';
import { dashboardAPI } from '../../api/dashboard.api';
import { userAPI } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import {
  FolderGit2,
  Kanban,
  List,
  Users,
  Activity as ActivityIcon,
  BarChart3,
  Shield,
  Calendar,
  AlertCircle,
  Clock,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import TaskModal from '../../components/tasks/TaskModal';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import {
  TaskStatusDoughnut,
  TaskPriorityBarChart,
  MemberWorkloadBarChart,
} from '../../components/charts/DashboardCharts';
import { PriorityBadge, StatusBadge, RoleBadge } from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollReveal from '../../components/common/ScrollReveal';
import ScrollHorizontalShadow from '../../components/common/ScrollHorizontalShadow';

export const ProjectDetailsPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'list' | 'members' | 'activity' | 'stats'
  const [loading, setLoading] = useState(true);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalStatus, setTaskModalStatus] = useState('todo');
  const [editingTask, setEditingTask] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const isOwner = project?.owner?._id === user?._id;
  const canManage = user?.role === 'admin' || (user?.role === 'manager' && isOwner);

  const fetchProjectData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectAPI.getProjectById(projectId),
        taskAPI.getTasks({ project: projectId, limit: 100 }),
      ]);
      setProject(projRes.data.data.project);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load activities when tab active
  const fetchActivity = useCallback(async () => {
    try {
      const res = await projectAPI.getProjectActivity(projectId, { limit: 50 });
      setActivities(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  }, [projectId]);

  // Load stats when tab active
  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboardAPI.getProjectStats(projectId);
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
    userAPI
      .getProjectMembers()
      .then((res) => setAvailableUsers(res.data.data.members || []))
      .catch(() => {});
  }, [fetchProjectData]);

  useEffect(() => {
    if (activeTab === 'activity') fetchActivity();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab, fetchActivity, fetchStats]);

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await projectAPI.deleteProject(projectId);
      navigate('/projects', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeletingProject(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskConfirm) return;
    try {
      await taskAPI.deleteTask(deleteTaskConfirm._id);
      setDeleteTaskConfirm(null);
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project workspace..." />;
  }

  if (!project) {
    return (
      <div className="dashboard-content-page text-center py-12">
        <AlertCircle size={40} className="text-danger mx-auto mb-2" />
        <h3 className="font-bold text-lg">Project Not Found or Access Denied</h3>
        <p className="text-sm text-muted mb-4">You may not be authorized to view this project repository.</p>
        <Link to="/projects" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-content-page animate-fade-in project-detail-scroll-experience">
      {/* Project Top Banner with Scroll Reveal */}
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="project-detail-banner">
          <div className="banner-top-row">
            <Link to="/projects" className="back-link">
              <ArrowLeft size={15} /> All Projects
            </Link>
            <div className="banner-badges">
              <span className={`status-pill pill-${project.status} uppercase text-xs font-semibold`}>
                {project.status}
              </span>
            </div>
          </div>

          <div className="banner-main-row">
            <div>
              <h1 className="project-banner-title">{project.name}</h1>
              <p className="project-banner-desc">{project.description}</p>
            </div>
            {canManage && (
              <button
                className="btn btn-danger"
                onClick={() => setDeleteProjectConfirm(true)}
              >
                <Trash2 size={16} /> Delete Project
              </button>
            )}
          </div>

          {/* Project Meta Bar */}
          <div className="project-meta-strip">
            <div className="meta-strip-item">
              <span className="text-muted text-xs">Project Owner:</span>
              <div className="flex-align-center gap-1 font-semibold text-xs">
                <Shield size={12} className="text-primary" />
                <span>{project.owner?.name}</span>
              </div>
            </div>
            <div className="meta-strip-item">
              <span className="text-muted text-xs">Total Tasks:</span>
              <span className="font-semibold text-xs">{tasks.length} Deliverables</span>
            </div>
            <div className="meta-strip-item">
              <span className="text-muted text-xs">Active Collaborators:</span>
              <span className="font-semibold text-xs">{project.members?.length || 0} Members</span>
            </div>
          </div>

          {/* Workspace Navigation Tabs with Sticky Glassmorphism Header */}
          <div className="project-tabs-bar sticky-tabs-bar">
            <button
              className={`tab-btn ${activeTab === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveTab('kanban')}
            >
              <Kanban size={15} />
              <span>Kanban Board</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <List size={15} />
              <span>Tasks Table</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <Users size={15} />
              <span>Team Members ({project.members?.length || 0})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <ActivityIcon size={15} />
              <span>Activity Timeline</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <BarChart3 size={15} />
              <span>Project Analytics</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Tab 1: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="tab-pane-content">
          <KanbanBoard
            tasks={tasks}
            members={project.members || []}
            onTaskClick={(t) => {
              setSelectedTaskId(t._id);
              setDetailsModalOpen(true);
            }}
            onAddTask={(status) => {
              setEditingTask(null);
              setTaskModalStatus(status);
              setTaskModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Tab 2: Tasks List View with Horizontal Shadow and Row Stagger */}
      {activeTab === 'list' && (
        <div className="tab-pane-content">
          <ScrollReveal variant="fade-up" duration={500}>
            <div className="dashboard-panel p-0 shadow-elevated">
              <ScrollHorizontalShadow>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Deliverable Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, idx) => (
                      <tr
                        key={task._id}
                        className="cursor-pointer table-row-animated"
                        style={{ animationDelay: `${(idx % 12) * 35}ms` }}
                        onClick={() => {
                          setSelectedTaskId(task._id);
                          setDetailsModalOpen(true);
                        }}
                      >
                        <td>
                          <span className="font-semibold text-sm hover-underline">{task.title}</span>
                        </td>
                        <td>
                          <StatusBadge status={task.status} />
                        </td>
                        <td>
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td>
                          {task.assignee ? (
                            <div className="flex-align-center gap-2">
                              <span className="avatar-xs-placeholder">
                                {task.assignee.name.charAt(0)}
                              </span>
                              <span className="text-xs">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted text-xs">Unassigned</span>
                          )}
                        </td>
                        <td>
                          {task.dueDate ? (
                            <span className="text-xs">
                              {new Date(task.dueDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-muted text-xs">-</span>
                          )}
                        </td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          {canManage && (
                            <button
                              className="btn-icon-danger"
                              title="Delete task"
                              onClick={() => setDeleteTaskConfirm(task)}
                            >
                              <AlertCircle size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollHorizontalShadow>
            </div>
          </ScrollReveal>
        </div>
      )}

      {/* Tab 3: Team Members */}
      {activeTab === 'members' && (
        <div className="tab-pane-content">
          <div className="members-grid-pane">
            {project.members?.map((m, idx) => {
              const isProjOwner = project.owner?._id === m._id;
              return (
                <ScrollReveal
                  key={m._id}
                  variant="tilt-3d"
                  delay={(idx % 6) * 60}
                  duration={500}
                >
                  <div className="team-member-card card-interactive-lift">
                    <div className="member-card-avatar">
                      <span>{m.name?.charAt(0)}</span>
                    </div>
                    <h4 className="member-card-name">{m.name}</h4>
                    <p className="member-card-email">{m.email}</p>
                    <div className="mt-2 flex-center gap-1">
                      <RoleBadge role={m.role} />
                      {isProjOwner && (
                        <span className="badge badge-primary text-xs">Lead</span>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Activity Timeline with Living Audit Trail */}
      {activeTab === 'activity' && (
        <div className="tab-pane-content">
          <ActivityTimeline activities={activities} />
        </div>
      )}

      {/* Tab 5: Analytics Charts */}
      {activeTab === 'stats' && stats && (
        <div className="tab-pane-content">
          <div className="charts-grid-2">
            <ScrollReveal variant="fade-up" delay={0} duration={600}>
              <div className="dashboard-panel shadow-elevated">
                <h3 className="panel-title mb-4">Deliverables By Status</h3>
                <TaskStatusDoughnut statusCounts={stats.statusCounts} />
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={120} duration={600}>
              <div className="dashboard-panel shadow-elevated">
                <h3 className="panel-title mb-4">Sprint Priority Distribution</h3>
                <TaskPriorityBarChart priorityCounts={stats.priorityCounts} />
              </div>
            </ScrollReveal>
          </div>
          {stats.memberDistribution && stats.memberDistribution.length > 0 && (
            <ScrollReveal variant="fade-up" delay={200} duration={600}>
              <div className="dashboard-panel mt-4 shadow-elevated">
                <h3 className="panel-title mb-4">Collaborator Workload Allocation</h3>
                <MemberWorkloadBarChart data={stats.memberDistribution} />
              </div>
            </ScrollReveal>
          )}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={editingTask}
        projectId={projectId}
        projects={[project]}
        members={project.members || []}
        initialStatus={taskModalStatus}
        onTaskSaved={fetchProjectData}
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
        onTaskUpdated={fetchProjectData}
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

      {/* Confirm Project Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteProjectConfirm}
        onClose={() => setDeleteProjectConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project Repository"
        message={`Are you sure you want to permanently delete project "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        danger={true}
      />
    </div>
  );
};

export default ProjectDetailsPage;
