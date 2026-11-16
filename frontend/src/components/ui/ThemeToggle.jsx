import { Moon, Sun } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button" className="theme-toggle" onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? <Moon size={19} /> : <Sun size={19} />}
      <span className="theme-toggle__dot" />
    </button>
  );
}
