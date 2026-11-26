import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/common/Alert';
import { Briefcase, ArrowRight, KeyRound } from 'lucide-react';

export const ManagerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFillDemo = () => {
    setEmail('sarah.manager@taskflow.io');
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email,
        password,
        portalRole: 'manager',
      });
      const target = location.state?.from?.pathname || '/manager/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Project Manager Gateway"
      subtitle="Sign in to oversee project roadmaps, assign sprint tasks, and track team velocity"
      roleTheme="manager"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="demo-credentials-box box-manager">
        <div className="demo-header">
          <KeyRound size={15} />
          <span>Evaluation Credentials (Manager)</span>
        </div>
        <p className="demo-text">
          <code>sarah.manager@taskflow.io</code> / <code>Password@123</code>
        </p>
        <button type="button" className="btn-demo-fill btn-fill-manager" onClick={handleFillDemo}>
          Auto-fill Manager Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="mgr-email">Work Email</label>
          <input
            id="mgr-email"
            type="email"
            className="form-input"
            placeholder="sarah.manager@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label className="form-label" htmlFor="mgr-pass">Password</label>
            <Link to="/forgot-password" className="auth-link-sm">
              Forgot password?
            </Link>
          </div>
          <input
            id="mgr-pass"
            type="password"
            className="form-input"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-manager-theme" disabled={loading}>
          {loading ? (
            'Opening Workspace...'
          ) : (
            <>
              <span>Sign In as Manager</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ManagerLoginPage;

