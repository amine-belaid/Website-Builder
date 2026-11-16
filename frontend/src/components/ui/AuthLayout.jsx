import { Zap, Palette, ShieldCheck } from 'lucide-react';
import Aurora from './Aurora';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import HeroArt from './HeroArt';

const FEATURES = [
  { icon: Zap, label: 'Lightning Fast', color: '#a855f7' },
  { icon: Palette, label: 'Beautiful Templates', color: '#ff4d94' },
  { icon: ShieldCheck, label: 'Secure & Reliable', color: '#8b7cf6' },
];

/** Split layout shared by Login and Register: marketing left, glass card right. */
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <Aurora />
      <header className="auth__top">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="auth__main">
        <section className="hero">
          <span className="hero__badge">
            <Zap size={15} fill="#fbbf24" color="#fbbf24" aria-hidden="true" />
            Build • Design • Launch
          </span>
          <h1 className="hero__title">
            <span>Create Your</span>
            <span className="grad">Dream Website</span>
          </h1>
          <p className="hero__lead">
            Build stunning websites with our easy drag-and-drop builder. No code required!
          </p>
          <ul className="hero__features">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <li key={label} className="hero__feature">
                <span className="hero__tile"><Icon size={24} color={color} fill={color} fillOpacity={0.25} aria-hidden="true" /></span>
                {label}
              </li>
            ))}
          </ul>
          <HeroArt />
        </section>

        <section className="auth-card glow-border" aria-live="polite">
          {children}
        </section>
      </main>
    </div>
  );
}
