import React, { useState } from 'react';
import { MessageSquare, Reply, Edit2, Trash2, Send, CornerDownRight, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { commentAPI } from '../../api/comment.api';

export const CommentThread = ({ taskId, comments = [], onCommentUpdated }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Submit root comment
  const handleAddRootComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.createComment({
        task: taskId,
        content: newComment.trim(),
      });
      setNewComment('');
      onCommentUpdated();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleAddReply = async (parentCommentId) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.createComment({
        task: taskId,
        content: replyContent.trim(),
        parentComment: parentCommentId,
      });
      setReplyContent('');
      setReplyingToId(null);
      onCommentUpdated();
    } catch (err) {
      console.error('Failed to reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      await commentAPI.updateComment(commentId, editContent.trim());
      setEditingCommentId(null);
      setEditContent('');
      onCommentUpdated();
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentAPI.deleteComment(commentId);
      onCommentUpdated();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const canModifyComment = (commentAuthorId) => {
    if (!user) return false;
    return (
      user._id === commentAuthorId ||
      user.role === 'admin' ||
      user.role === 'manager'
    );
  };

  return (
    <div className="comment-thread-section">
      <div className="comment-section-header">
        <MessageSquare size={18} className="text-primary" />
        <h4 className="font-semibold text-sm">Comments & Discussions</h4>
      </div>

      {/* Root Comment Input */}
      <form onSubmit={handleAddRootComment} className="comment-input-box">
        <textarea
          className="comment-textarea"
          rows={2}
          placeholder="Share feedback, updates, or ask a question..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="comment-submit-bar">
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={submitting || !newComment.trim()}
          >
            <Send size={14} />
            <span>Comment</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="empty-comments-text">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((root) => {
            const isEditingRoot = editingCommentId === root._id;
            const canModifyRoot = canModifyComment(root.author?._id);

            return (
              <div key={root._id} className="comment-node">
                <div className="comment-bubble-wrapper">
                  <div className="comment-avatar">
                    <span>{root.author?.name?.charAt(0) || 'U'}</span>
                  </div>

                  <div className="comment-bubble">
                    <div className="comment-meta">
                      <span className="comment-author-name">{root.author?.name}</span>
                      <span className="comment-date">
                        {new Date(root.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {root.isEdited && <span className="comment-edited-pill">(edited)</span>}
                    </div>

                    {isEditingRoot ? (
                      <div className="inline-edit-box">
                        <textarea
                          className="comment-textarea"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="inline-edit-actions">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleSaveEdit(root._id)}
                            disabled={submitting}
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => setEditingCommentId(null)}
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{root.content}</p>
                    )}

                    <div className="comment-actions">
                      <button
                        className="comment-action-btn"
                        onClick={() => {
                          setReplyingToId(root._id);
                          setReplyContent('');
                        }}
                      >
                        <Reply size={13} />
                        <span>Reply</span>
                      </button>

                      {user?._id === root.author?._id && (
                        <button
                          className="comment-action-btn"
                          onClick={() => {
                            setEditingCommentId(root._id);
                            setEditContent(root.content);
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                      )}

                      {canModifyRoot && (
                        <button
                          className="comment-action-btn action-delete"
                          onClick={() => handleDeleteComment(root._id)}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingToId === root._id && (
                  <div className="reply-input-row animate-fade-in">
                    <CornerDownRight size={16} className="reply-indicator-arrow" />
                    <div className="reply-box-inner">
                      <input
                        type="text"
                        className="reply-input"
                        placeholder={`Reply to ${root.author?.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => handleAddReply(root._id)}
                        disabled={submitting || !replyContent.trim()}
                      >
                        Reply
                      </button>
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => setReplyingToId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested 1-Level Replies */}
                {root.replies && root.replies.length > 0 && (
                  <div className="replies-subthread">
                    {root.replies.map((reply) => {
                      const isEditingReply = editingCommentId === reply._id;
                      const canModifyReply = canModifyComment(reply.author?._id);

                      return (
                        <div key={reply._id} className="comment-bubble-wrapper reply-wrapper">
                          <div className="comment-avatar avatar-sm">
                            <span>{reply.author?.name?.charAt(0) || 'U'}</span>
                          </div>

                          <div className="comment-bubble bubble-reply">
                            <div className="comment-meta">
                              <span className="comment-author-name">{reply.author?.name}</span>
                              <span className="comment-date">
                                {new Date(reply.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {reply.isEdited && <span className="comment-edited-pill">(edited)</span>}
                            </div>

                            {isEditingReply ? (
                              <div className="inline-edit-box">
                                <input
                                  type="text"
                                  className="reply-input"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                />
                                <div className="inline-edit-actions mt-1">
                                  <button
                                    className="btn btn-xs btn-primary"
                                    onClick={() => handleSaveEdit(reply._id)}
                                    disabled={submitting}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-xs btn-secondary"
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="comment-text">{reply.content}</p>
                            )}

                            <div className="comment-actions">
                              {user?._id === reply.author?._id && (
                                <button
                                  className="comment-action-btn"
                                  onClick={() => {
                                    setEditingCommentId(reply._id);
                                    setEditContent(reply.content);
                                  }}
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </button>
                              )}

                              {canModifyReply && (
                                <button
                                  className="comment-action-btn action-delete"
                                  onClick={() => handleDeleteComment(reply._id)}
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentThread;
