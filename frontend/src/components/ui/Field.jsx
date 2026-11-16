import { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Input with a leading icon cell. Passwords get a show/hide button.
 * `below` renders between the input and the error (e.g. a strength meter).
 */
export default function Field({ id, label, type = 'text', icon: Icon, error, below, ...rest }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const errId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className={`input-group${error ? ' has-error' : ''}`}>
        <span className="input-group__icon" aria-hidden="true">
          {Icon && <Icon size={20} strokeWidth={1.8} />}
        </span>
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button" className="input-group__action"
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
          >
            {show ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
      {below}
      {error && (
        <p id={errId} className="field__error" role="alert">
          <AlertCircle size={14} />{error}
        </p>
      )}
    </div>
  );
}
