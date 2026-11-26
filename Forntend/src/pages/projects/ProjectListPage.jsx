import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { projectAPI } from "../../api/project.api";
import { userAPI } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import {
  FolderGit2,
  Search,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import ProjectModal from "../../components/projects/ProjectModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { CardSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { getVisibleProjects } from "../../utils/projectVisibility";
import ScrollReveal from "../../components/common/ScrollReveal";

export const ProjectListPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);

  const canCreateProject = user?.role === "admin" || user?.role === "manager";

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectAPI.getProjects({
        search,
        status: statusFilter,
        limit: 50,
      });
      setProjects(data.data || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
    if (canCreateProject) {
      userAPI
        .getProjectMembers()
        .then((res) => setAvailableUsers(res.data.data.members || []))
        .catch(() => {});
    }
  }, [fetchProjects, canCreateProject]);

  const handleDeleteProject = async () => {
    if (!deleteConfirmProject) return;
    try {
      await projectAPI.deleteProject(deleteConfirmProject._id);
      setDeleteConfirmProject(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  const visibleProjects = getVisibleProjects(projects, user);

  return (
    <div className="dashboard-content-page animate-fade-in projects-scroll-experience">
      <ScrollReveal variant="fade-up" duration={500}>
        <div
          className="page-header"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div className="projects-badge-pill">
              <Sparkles size={14} className="text-teal-600" />
              <span>Workspace Repositories</span>
            </div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">
              Manage sprint deliverables, team access, and project progress
            </p>
          </div>
          {canCreateProject && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingProject(null);
                setProjectModalOpen(true);
              }}
            >
              <Plus size={16} /> Add Project
            </button>
          )}
        </div>
      </ScrollReveal>

      {/* Sticky Filter Bar on Scroll */}
      <div className="table-controls-bar sticky-filter-bar">
        <div className="search-input-wrapper" style={{ maxWidth: "360px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid with Staggered 3D Tilt Entrance */}
      {loading ? (
        <div className="projects-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : visibleProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description="There are currently no projects matching your query or accessible to your account."
        />
      ) : (
        <div
          className="projects-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {visibleProjects.map((project, index) => {
            const accentColors = ["#16877e", "#2857b8", "#7553bc", "#c17a22", "#405d3e"];
            const accent = accentColors[index % accentColors.length];

            return (
              <ScrollReveal
                key={project._id}
                variant="tilt-3d"
                delay={(index % 6) * 60}
                duration={550}
              >
                <div
                  className="project-card project-list-card card-interactive-lift"
                  style={{
                    "--project-accent": accent,
                  }}
                >
                  <div className="project-card-top-accent" style={{ backgroundColor: accent }} />
                  <div className="project-card-body-content">
                    <div className="flex-between mb-2">
                      <span className={`status-pill pill-${project.status} text-xs uppercase`}>
                        {project.status || "active"}
                      </span>
                      {project.members && (
                        <div className="flex-align-center gap-1 text-xs text-muted">
                          <Users size={12} />
                          <span>{project.members.length}</span>
                        </div>
                      )}
                    </div>
                    <div className="project-list-name font-bold text-base mb-1">
                      {project.name}
                    </div>
                    {project.description && (
                      <p className="project-card-desc-clamp text-xs text-secondary mb-3">
                        {project.description}
                      </p>
                    )}
                    <Link
                      to={`/projects/${project._id}`}
                      className="project-list-open btn btn-sm btn-secondary w-full flex-center gap-2"
                      aria-label={`Open ${project.name}`}
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={editingProject}
        availableUsers={availableUsers}
        onProjectSaved={fetchProjects}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmProject}
        onClose={() => setDeleteConfirmProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project Repository"
        message={`Are you sure you want to permanently delete project "${deleteConfirmProject?.name}"? All associated tasks, comments, and activities will also be deleted.`}
        confirmText="Delete Project"
        danger={true}
      />
    </div>
  );
};

export default ProjectListPage;
