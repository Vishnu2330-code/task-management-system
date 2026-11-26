import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth.api';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/common/Alert';
import { Lock, ArrowRight } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      return setError('Reset token is missing or invalid.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      const { data } = await authAPI.resetPassword({ token, password });
      setSuccess(data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login/member');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a secure new password for your account"
      roleTheme="member"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="reset-token">Reset Token</label>
          <input
            id="reset-token"
            type="text"
            className="form-input"
            placeholder="Paste reset token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-pass">New Password</label>
          <input
            id="reset-pass"
            type="password"
            className="form-input"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-confirm">Confirm New Password</label>
          <input
            id="reset-confirm"
            type="password"
            className="form-input"
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Updating Password...' : 'Save New Password'}
        </button>

        <div className="auth-footer-links">
          <Link to="/login/member" className="auth-link">
            Return to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

