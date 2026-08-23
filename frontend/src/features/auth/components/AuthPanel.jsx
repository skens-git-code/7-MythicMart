import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ROUTES, toHashPath } from '../../../utils/routes';
import { authBenefits } from '../../../data/siteContent';
import '../../../styles/PremiumPages.css';

const AuthPanel = ({ mode }) => {
  const { login, register, error } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = {
    login: ['Welcome back', 'Access orders, wishlist, rewards, and dashboard tools.'],
    signup: ['Create account', 'Start a protected shopping profile with personalized recommendations.'],
    forgot: ['Reset password', 'Receive a secure recovery link and OTP verification.'],
    otp: ['Verify OTP', 'Confirm your identity before sensitive account changes.'],
  };
  const [title, description] = labels[mode];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result = { success: false, error: 'Invalid action' };

    if (mode === 'login') {
      result = await login(formData.email, formData.password);
    } else if (mode === 'signup') {
      result = await register(formData.name, formData.email, formData.password);
    }

    if (result.success) {
      if (mode === 'login' || mode === 'signup') {
        addToast(`Welcome, ${formData.email}!`, 'success');
        window.location.hash = ROUTES.DASHBOARD;
      }
    } else {
      addToast(result.error || 'Authentication failed', 'error');
    }
    
    setIsSubmitting(false);
  };

  return (
    <section className="auth-layout section-transition">
      <div className="auth-copy">
        <span className="hero-subtitle">Secure Access</span>
        <h1 className="hero-title-fade-in">{title}</h1>
        <p className="elegant-text">{description}</p>
        <div className="auth-benefit-list">
          {authBenefits.map(({ icon, title: itemTitle, description: itemDescription }) => (
            <div key={itemTitle}>
              {React.createElement(icon, { size: 18, 'aria-hidden': true })}
              <span>{itemTitle}</span>
              <small>{itemDescription}</small>
            </div>
          ))}
        </div>
      </div>
      <form className="glass-card auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</div>}
        
        {mode === 'signup' && (
          <label>
            Name
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
          </label>
        )}
        
        {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </label>
        )}
        
        {(mode === 'login' || mode === 'signup') && (
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required minLength={8} />
          </label>
        )}
        
        
        <button type="submit" className="cta-button" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {isSubmitting ? 'Processing...' : (
            <>
              {mode === 'login' ? 'Login' : 'Create account'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
        
        <div className="auth-links">
          {mode !== 'login' && <a href={toHashPath(ROUTES.LOGIN)}>Login</a>}
          {mode !== 'signup' && <a href={toHashPath(ROUTES.SIGNUP)}>Signup</a>}
        </div>
      </form>
    </section>
  );
};

export default AuthPanel;
