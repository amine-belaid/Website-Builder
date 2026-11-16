import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthLayout from '../components/ui/AuthLayout';
import { LogoMark } from '../components/ui/Logo';
import Field from '../components/ui/Field';
import SocialButtons from '../components/ui/SocialButtons';

/* ─── Password strength helper ───────────────────────────────── */
const STRENGTH_COLORS = ['#f87171', '#fb923c', '#facc15', '#34d399'];
const STRENGTH_LABELS = ['Too short', 'Weak', 'Good', 'Strong'];
function getStrength(pwd) {
  if (pwd.length < 6) return 1;
  let s = 1;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 10) s++;
  return Math.min(s, 4);
}

export default function RegisterPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [errors, setErrors]       = useState({});
  const [globalErr, setGlobalErr] = useState('');
  const [notice, setNotice]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const strength = password ? getStrength(password) : 0;
  const { register } = useAuthStore();
  const navigate     = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim())                     e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password)                         e.password = 'Password is required';
    else if (password.length < 8)          e.password = 'Use at least 8 characters';
    if (!confirm)                          e.confirm = 'Please confirm your password';
    else if (confirm !== password)         e.confirm = 'Passwords do not match';
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
      await register(email, password);        // POST /auth/register via authStore
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setGlobalErr(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const meter = password && (
    <>
      <div className="strength" aria-hidden="true">
        {[1, 2, 3, 4].map(i => (
          <i key={i} style={i <= strength ? { background: STRENGTH_COLORS[strength - 1] } : undefined} />
        ))}
      </div>
      <div className="strength-label" style={{ color: STRENGTH_COLORS[strength - 1] }}>
        {STRENGTH_LABELS[strength - 1]}
      </div>
    </>
  );

  return (
    <AuthLayout>
      {success ? (
        <div className="auth-success">
          <div className="auth-success__icon"><Check size={30} strokeWidth={2.5} /></div>
          <h2 className="auth-card__title">Account created</h2>
          <p className="auth-card__sub">Redirecting to your dashboard…</p>
        </div>
      ) : (
        <>
          <div className="auth-card__head">
            <span className="auth-card__mark"><LogoMark size={56} /></span>
            <h2 className="auth-card__title">Create your account</h2>
            <p className="auth-card__sub">Free to start. No credit card needed.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {globalErr && <div className="alert alert--error" role="alert"><AlertCircle size={16} />{globalErr}</div>}
            {notice && <div className="alert alert--info" role="status"><Info size={16} />{notice}</div>}

            <Field
              id="reg-email" label="Email address" type="email" icon={Mail}
              placeholder="Email address" autoComplete="email"
              value={email} error={errors.email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
            />
            <Field
              id="reg-password" label="Password" type="password" icon={Lock}
              placeholder="Password (at least 8 characters)" autoComplete="new-password"
              value={password} error={errors.password} below={meter}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
            />
            <Field
              id="reg-confirm" label="Confirm password" type="password" icon={ShieldCheck}
              placeholder="Confirm password" autoComplete="new-password"
              value={confirm} error={errors.confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
            />

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? <><Loader2 size={18} className="spin" />Creating account…</> : <>Create account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="auth-terms">
            By creating an account you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
          </p>

          <div className="divider" style={{ marginTop: 22 }}>Or sign up with</div>
          <SocialButtons onSelect={p => setNotice(`${p} sign-up isn’t available yet. Use your email and password for now.`)} />

          <p className="auth-foot">Already have an account?<Link to="/login">Sign in</Link></p>
        </>
      )}
    </AuthLayout>
  );
}
