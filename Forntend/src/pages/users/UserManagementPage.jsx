import React, { useState, useEffect, useCallback } from "react";
import { userAPI } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import { Users, Search, Plus, Edit2, Trash2, Shield, Sparkles } from "lucide-react";
import { RoleBadge } from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import Alert from "../../components/common/Alert";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ScrollReveal from "../../components/common/ScrollReveal";
import ScrollHorizontalShadow from "../../components/common/ScrollHorizontalShadow";

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    department: "Engineering",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getUsers({
        page,
        limit,
        search,
        role: roleFilter,
      });

      const userList = data.data || [];
      setUsers(userList);
      setTotal(data.pagination?.total || userList.length);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "member",
      department: "Engineering",
    });
    setModalError("");
    setUserModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "Engineering",
    });
    setModalError("");
    setUserModalOpen(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);

    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser._id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
        });
      } else {
        await userAPI.createUser(formData);
      }
      setUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
          (err.response?.data?.errors &&
            err.response.data.errors[0]?.message) ||
          "Failed to save user account",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;
    try {
      await userAPI.deleteUser(confirmDeleteUser._id);
      setConfirmDeleteUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="dashboard-content-page animate-fade-in users-scroll-experience">
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div className="users-badge-pill">
                <Sparkles size={14} className="text-purple-600" />
                <span>Enterprise Directory Governance</span>
              </div>
              <h1 className="page-title">User Governance & Access Control</h1>
              <p className="page-subtitle">
                Manage system users, assign administrative or managerial roles,
                and audit access permissions
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Sticky Filter and Search Bar */}
      <div className="table-controls-bar sticky-table-controls">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-select-group">
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Users Table with Horizontal Scroll Shadows and Staggered Rows */}
      <ScrollReveal variant="fade-up" duration={550}>
        <div className="dashboard-panel p-0 shadow-elevated">
          <ScrollHorizontalShadow>
            <table className="data-table sticky-header-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => {
                  const isSelf = u._id === currentUser?._id;

                  return (
                    <tr
                      key={u._id}
                      className="table-row-animated"
                      style={{ animationDelay: `${(idx % 10) * 30}ms` }}
                    >
                      <td>
                        <div className="flex-align-center gap-3">
                          <div className="avatar-sm-placeholder">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {u.name}{" "}
                              {isSelf && (
                                <span className="text-xs text-primary font-bold">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <RoleBadge role={u.role} />
                      </td>
                      <td>{u.department || "Engineering"}</td>
                      <td className="text-xs text-muted">
                        {new Date(u.createdAt).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="text-right">
                        <div className="table-actions-row">
                          <button
                            className="btn-icon"
                            title="Edit user details"
                            onClick={() => handleOpenEditModal(u)}
                          >
                            <Edit2 size={15} />
                          </button>

                          {!isSelf && (
                            <button
                              className="btn-icon btn-icon-danger"
                              title="Delete user"
                              onClick={() => setConfirmDeleteUser(u)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollHorizontalShadow>

          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* User Create / Edit Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? "Edit User Account" : "Provision New User"}
      >
        <form onSubmit={handleSubmitUser} className="auth-form">
          {modalError && <Alert type="error" message={modalError} />}

          <div className="form-group">
            <label className="form-label" htmlFor="user-name">Full Name</label>
            <input
              id="user-name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-email">Email Address</label>
            <input
              id="user-email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {!editingUser && (
            <div className="form-group">
              <label className="form-label" htmlFor="user-pw">Initial Password</label>
              <input
                id="user-pw"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">Assigned Role</label>
              <select
                id="user-role"
                className="form-select"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-dept">Department</label>
              <select
                id="user-dept"
                className="form-select"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setUserModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={modalLoading}
            >
              {modalLoading
                ? "Saving..."
                : editingUser
                  ? "Update Account"
                  : "Provision Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleConfirmDelete}
        title="Revoke User Access"
        message={`Are you sure you want to permanently delete user "${confirmDeleteUser?.name}"? All assigned items will be unlinked.`}
        confirmText="Delete Account"
        danger={true}
      />
    </div>
  );
};

export default UserManagementPage;
