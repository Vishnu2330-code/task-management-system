import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth.api';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/common/Alert';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');
    setLoading(true);

    try {
      const { data } = await authAPI.forgotPassword({ email });
      setMessage(data.message || 'If an account exists, a reset link has been dispatched.');
      if (data.data?.resetToken) {
        setResetToken(data.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the email associated with your account to receive password reset instructions"
      roleTheme="member"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {message && <Alert type="info" message={message} />}

      {resetToken && (
        <div className="demo-credentials-box box-member mt-3">
          <p className="text-xs font-semibold mb-1">Generated Reset Token (Demo & Evaluation):</p>
          <code className="text-xs break-all">{resetToken}</code>
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => navigate(`/reset-password?token=${resetToken}`)}
            >
              Proceed to Reset Password with this Token
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="forgot-email">Registered Email Address</label>
          <input
            id="forgot-email"
            type="email"
            className="form-input"
            placeholder="your.email@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Dispatched Token...' : 'Send Password Reset Link'}
        </button>

        <div className="auth-footer-links">
          <Link to="/login/member" className="auth-link-icon">
            <ArrowLeft size={16} />
            <span>Return to Login</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

