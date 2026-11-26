import React, { useState } from 'react';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import { projectAPI } from '../../api/project.api';
import { UserPlus, UserMinus, Shield } from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export const MemberManagerModal = ({
  isOpen,
  onClose,
  project,
  availableUsers = [],
  onMembersUpdated,
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!project) return null;

  // Filter users not already in members
  const memberIds = project.members ? project.members.map((m) => m._id) : [];
  const nonMembers = availableUsers.filter((u) => !memberIds.includes(u._id));

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setError('');
    setLoading(true);

    try {
      await projectAPI.addMember(project._id, selectedUserId);
      setSelectedUserId('');
      onMembersUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member to project');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;

    setError('');
    try {
      await projectAPI.removeMember(project._id, userId);
      onMembersUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Project Collaborators" maxWidth="560px">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Add New Member Section */}
      <form onSubmit={handleAddMember} className="add-member-form mb-4">
        <label className="form-label">Add Colleague to Project</label>
        <div className="flex-row gap-2">
          <select
            className="form-select flex-1"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select a team member to add...</option>
            {nonMembers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role} - {u.department})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedUserId}
          >
            <UserPlus size={16} /> Add
          </button>
        </div>
      </form>

      <hr className="divider" />

      {/* Current Project Members List */}
      <div className="current-members-list">
        <h4 className="text-sm font-semibold mb-3">
          Current Project Members ({project.members?.length || 0})
        </h4>

        <div className="members-scroll">
          {project.members?.map((member) => {
            const isOwner = project.owner?._id === member._id;

            return (
              <div key={member._id} className="member-row-card">
                <div className="member-row-left">
                  <div className="avatar-sm-placeholder">
                    {member.name?.charAt(0)}
                  </div>
                  <div className="member-details-text">
                    <div className="flex-align-center gap-2">
                      <span className="font-semibold text-sm">{member.name}</span>
                      {isOwner && (
                        <span className="badge-owner-pill">
                          <Shield size={11} /> Project Owner
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted">{member.email}</span>
                  </div>
                </div>

                <div className="member-row-right">
                  <RoleBadge role={member.role} />
                  {!isOwner && (
                    <button
                      className="btn-icon-danger ml-2"
                      title="Remove member"
                      onClick={() => handleRemoveMember(member._id)}
                    >
                      <UserMinus size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default MemberManagerModal;
