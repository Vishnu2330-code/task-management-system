import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/common/Alert';
import { ArrowRight, UserPlus } from 'lucide-react';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login/${formData.role}`);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
          'Registration failed. Please review your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Account"
      subtitle="Join TaskFlow to organize sprints, assign deliverables, and ship projects faster"
      roleTheme="member"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            className="form-input"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">Work Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="jane.doe@organization.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-role">Workspace Role</label>
          <select
            id="signup-role"
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="member">Team Member (Collaborator)</option>
            <option value="manager">Project Manager (Team Lead)</option>
          </select>
          <span className="field-hint">
            Note: Admin privileges are granted exclusively by existing administrators.
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="signup-pass">Password</label>
            <input
              id="signup-pass"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? (
            'Creating Account...'
          ) : (
            <>
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="auth-footer-links">
          <span>Already registered?</span>{' '}
          <Link to="/login/member" className="auth-link">
            Log in to your portal
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;

