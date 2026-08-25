import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LoaderCircle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ROUTES, toHashPath } from '../../../utils/routes';
import { authBenefits } from '../../../data/siteContent';
import '../../../styles/PremiumPages.css';

const AuthPanel = ({ mode }) => {
  const { login, register, requestPasswordReset, verifyOtp, resetPassword, error } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'verify' | 'new_password'
  const [statusMessage, setStatusMessage] = useState(null);

  const labels = {
    login: ['Welcome back', 'Access orders, wishlist, rewards, and dashboard tools.'],
    signup: ['Create account', 'Start a protected shopping profile with personalized recommendations.'],
    forgot: ['Reset password', 'Receive a secure recovery link and 6-digit verification OTP code.'],
    otp: ['Verify OTP', 'Confirm your identity before completing password or account recovery.'],
  };
  const [title, description] = labels[mode] || labels.login;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    
    let result = { success: false, error: 'Invalid action' };

    if (mode === 'login') {
      result = await login(formData.email, formData.password);
      if (result.success) {
        addToast(`Welcome back!`, 'success');
        window.location.hash = toHashPath(ROUTES.DASHBOARD);
      }
    } else if (mode === 'signup') {
      result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        addToast(`Welcome to MythicMart, ${formData.name || formData.email}!`, 'success');
        window.location.hash = toHashPath(ROUTES.DASHBOARD);
      }
    } else if (mode === 'forgot') {
      if (resetStep === 'request') {
        result = await requestPasswordReset(formData.email);
        if (result.success) {
          setStatusMessage(result.data?.message || 'Verification code sent to your email.');
          addToast('Verification OTP sent to your email!', 'success');
          setResetStep('verify');
        }
      } else if (resetStep === 'verify') {
        result = await verifyOtp(formData.email, formData.otp);
        if (result.success) {
          setStatusMessage('OTP verified! Now enter your new password.');
          addToast('OTP verified successfully.', 'success');
          setResetStep('new_password');
        }
      } else if (resetStep === 'new_password') {
        if (formData.password !== formData.confirmPassword) {
          result = { success: false, error: 'Passwords do not match.' };
        } else {
          result = await resetPassword(formData.email, formData.password, formData.otp);
          if (result.success) {
            addToast('Password successfully reset! Logged in.', 'success');
            window.location.hash = toHashPath(ROUTES.DASHBOARD);
          }
        }
      }
    } else if (mode === 'otp') {
      result = await verifyOtp(formData.email, formData.otp);
      if (result.success) {
        addToast('OTP verified successfully!', 'success');
        window.location.hash = toHashPath(ROUTES.FORGOT_PASSWORD);
      }
    }

    if (!result.success) {
      addToast(result.error || 'Action failed', 'error');
    }
    
    setIsSubmitting(false);
  };

  return (
    <section className="auth-layout section-transition" aria-labelledby="auth-heading">
      <div className="auth-copy">
        <span className="hero-subtitle">Secure Access</span>
        <h1 id="auth-heading" className="hero-title-fade-in">{title}</h1>
        <p className="elegant-text">{description}</p>
        <div className="auth-benefit-list">
          {authBenefits.map(({ icon, title: itemTitle, description: itemDescription }) => (
            <div key={itemTitle}>
              {React.createElement(icon, { size: 18, 'aria-hidden': 'true' })}
              <span>{itemTitle}</span>
              <small>{itemDescription}</small>
            </div>
          ))}
        </div>
      </div>
      <form className="glass-card auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        {statusMessage && (
          <div className="form-success" role="status" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}
        
        {mode === 'signup' && (
          <label>
            Name
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" autoComplete="name" required />
          </label>
        )}
        
        {(mode === 'login' || mode === 'signup' || (mode === 'forgot' && resetStep === 'request') || mode === 'otp') && (
          <label>
            Email Address
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
          </label>
        )}

        {(mode === 'otp' || (mode === 'forgot' && resetStep === 'verify')) && (
          <label>
            6-Digit Verification Code (OTP)
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="otp"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                autoComplete="one-time-code"
                style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center', fontFamily: 'monospace' }}
                required
              />
            </div>
            <small className="field-help">Enter the 6-digit passcode sent to your email.</small>
          </label>
        )}
        
        {(mode === 'login' || mode === 'signup' || (mode === 'forgot' && resetStep === 'new_password')) && (
          <label>
            {mode === 'forgot' ? 'New Password' : 'Password'}
            <span className="password-field">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {(mode === 'signup' || mode === 'forgot') && <small className="field-help">Must be at least 8 characters with uppercase, lowercase, and number.</small>}
          </label>
        )}

        {mode === 'forgot' && resetStep === 'new_password' && (
          <label>
            Confirm New Password
            <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" required minLength={8} />
          </label>
        )}
        
        <button type="submit" className="cta-button" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {isSubmitting ? <><LoaderCircle size={18} className="spin" /> Processing...</> : (
            <>
              {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? (resetStep === 'request' ? 'Send Verification Code' : resetStep === 'verify' ? 'Verify Code' : 'Set New Password') : 'Verify OTP'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
        
        <div className="auth-links">
          {mode === 'login' && <a href={toHashPath(ROUTES.FORGOT_PASSWORD)}>Forgot password?</a>}
          {mode === 'forgot' && resetStep !== 'request' && <button type="button" onClick={() => setResetStep('request')} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', textDecoration: 'underline' }}>Resend verification code</button>}
          {mode !== 'login' && <a href={toHashPath(ROUTES.LOGIN)}>Sign In</a>}
          {mode !== 'signup' && <a href={toHashPath(ROUTES.SIGNUP)}>Create New Account</a>}
        </div>
      </form>
    </section>
  );
};

export default AuthPanel;
