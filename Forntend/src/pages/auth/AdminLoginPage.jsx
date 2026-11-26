import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/common/Alert';
import { ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFillDemo = () => {
    setEmail('admin@taskflow.io');
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
        portalRole: 'admin',
      });
      const target = location.state?.from?.pathname || '/admin/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Control Center"
      subtitle="Sign in with your administrative credentials to manage system governance"
      roleTheme="admin"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Demo Credentials Quick Fill Banner */}
      <div className="demo-credentials-box box-admin">
        <div className="demo-header">
          <KeyRound size={15} />
          <span>Evaluation Credentials (Admin)</span>
        </div>
        <p className="demo-text">
          <code>admin@taskflow.io</code> / <code>Password@123</code>
        </p>
        <button type="button" className="btn-demo-fill" onClick={handleFillDemo}>
          Auto-fill Admin Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="admin-email">Admin Email Address</label>
          <input
            id="admin-email"
            type="email"
            className="form-input"
            placeholder="admin@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="admin-pass">Master Password</label>
          <input
            id="admin-pass"
            type="password"
            className="form-input"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-admin-theme" disabled={loading}>
          {loading ? (
            'Verifying Authority...'
          ) : (
            <>
              <span>Authenticate as Admin</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminLoginPage;
