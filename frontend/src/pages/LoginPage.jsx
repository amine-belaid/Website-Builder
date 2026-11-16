import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/ui/AuthLayout';
import { LogoMark } from '../components/ui/Logo';
import Field from '../components/ui/Field';
import SocialButtons from '../components/ui/SocialButtons';

const REMEMBER_KEY = 'wb-remember-email';
const readRemembered = () => { try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; } };

export default function LoginPage() {
  const [email, setEmail]         = useState(readRemembered);
  const [password, setPassword]   = useState('');
  const [remember, setRemember]   = useState(true);
  const [errors, setErrors]       = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [notice, setNotice]       = useState('');
  const [loading, setLoading]     = useState(false);

  const { login } = useAuthStore();
  const navigate  = useNavigate();

  /* Validate all fields, return true if clean */
  const validate = () => {
    const e = {};
    if (!email.trim())                     e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password)                         e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setGlobalErr('');
    setNotice('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);          // POST /auth/login via authStore
      try {                                  // "Remember me" keeps the email for next time
        if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch { /* storage blocked */ }
      navigate('/');
    } catch (err) {
      setGlobalErr(err.response?.data?.error || 'Sign in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card__head">
        <span className="auth-card__mark"><LogoMark size={56} /></span>
        <h2 className="auth-card__title">Welcome back!</h2>
        <p className="auth-card__sub">Sign in to continue building amazing websites.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {globalErr && <div className="alert alert--error" role="alert"><AlertCircle size={16} />{globalErr}</div>}
        {notice && <div className="alert alert--info" role="status"><Info size={16} />{notice}</div>}

        <Field
          id="login-email" label="Email address" type="email" icon={Mail}
          placeholder="Email address" autoComplete="email"
          value={email} error={errors.email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
        />
        <Field
          id="login-password" label="Password" type="password" icon={Lock}
          placeholder="Password" autoComplete="current-password"
          value={password} error={errors.password}
          onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
        />

        <div className="auth-row">
          <label className="check">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span className="check__box"><Check size={14} strokeWidth={3} /></span>
            Remember me
          </label>
          <button type="button" className="link" onClick={() => setNotice('Password reset isn’t available yet.')}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? <><Loader2 size={18} className="spin" />Signing in…</> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="divider" style={{ marginTop: 26 }}>Or continue with</div>
      <SocialButtons onSelect={p => setNotice(`${p} sign-in isn’t available yet. Use your email and password for now.`)} />

      <p className="auth-foot">Don’t have an account?<Link to="/register">Create one</Link></p>
    </AuthLayout>
  );
}
