import { useState } from 'react';

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  const isRegister = mode === 'register';

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (isRegister) {
      if (!form.name.trim()) e.name = 'Name is required';
      else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

      if (!form.phone.trim()) e.phone = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter valid 10-digit phone number';
    }
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';

    if (isRegister) {
      if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(isRegister ? 'Registration successful! Welcome to EduAcademy.' : 'Signed in successfully! Welcome back.');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-logo">
          <div className="modal-logo-icon">🎓</div>
          <span>EduAcademy</span>
        </div>

        <h2>{isRegister ? 'Create Your Account' : 'Welcome Back!'}</h2>
        <p className="modal-desc">
          {isRegister
            ? 'Join thousands of learners and start your journey today.'
            : 'Sign in to continue your learning journey.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Adesh Kumar"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className={errors.name ? 'error-input' : ''}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  className={errors.phone ? 'error-input' : ''}
                  maxLength={10}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className={errors.email ? 'error-input' : ''}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder={isRegister ? 'Create a password (min 6 chars)' : 'Enter your password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              className={errors.password ? 'error-input' : ''}
            />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'error-input' : ''}
              />
              {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" className="form-submit" disabled={loading}>
            {loading
              ? (isRegister ? 'Creating Account...' : 'Signing In...')
              : (isRegister ? ' Account' : ' Sign In')}
          </button>
        </form>

        <div className="divider">or</div>

        <p className="form-switch">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span onClick={onSwitch}>{isRegister ? 'Sign In' : 'Register Free'}</span>
        </p>
      </div>
    </div>
  );
}
