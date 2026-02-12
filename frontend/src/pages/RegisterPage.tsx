import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateInputs = () => {
    if (username.length < 4 || username.length > 20) {
      setError(t.register.usernameInvalid);
      return false;
    }

    if (password.length < 8) {
      setError(t.register.passwordTooShort);
      return false;
    }

    if (password !== confirmPassword) {
      setError(t.register.passwordMismatch);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      await authService.register(username, password);
      setSuccessMessage(t.register.success);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(t.register.usernameTaken);
      } else {
        setError(t.errors.registerFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{t.register.title}</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t.common.username}</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder={t.register.usernamePlaceholder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.common.password}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder={t.register.passwordPlaceholder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t.register.confirmPassword}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? t.register.processing : t.register.button}
          </button>
        </form>

        <div className="auth-link">
          {t.register.hasAccount} <Link to="/login">{t.register.signIn}</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;