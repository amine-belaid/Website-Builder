import { Link } from 'react-router-dom';

/** Pink rounded-square "b" mark. */
export function LogoMark({ size = 44 }) {
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="wb-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5c9a" />
          <stop offset="1" stopColor="#f0157a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#wb-logo-g)" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M13 13Q13 10 16 10H18Q21 10 21 13V19H27Q35 19 35 28V29Q35 38 27 38H16Q13 38 13 35ZM24 26H26Q29 26 29 29Q29 32 26 32H24Q21 32 21 29Q21 26 24 26Z"
      />
    </svg>
  );
}

/** Mark + "Website Builder" wordmark. Pass `to` to make it a link. */
export default function Logo({ size = 44, small = false, to }) {
  const inner = (
    <>
      <LogoMark size={size} />
      <span className="logo__text">Website <b>Builder</b></span>
    </>
  );
  const cls = `logo${small ? ' logo--sm' : ''}`;
  return to ? <Link to={to} className={cls}>{inner}</Link> : <span className={cls}>{inner}</span>;
}
