/** 3D-style browser + cursor + "add block" card, with an orbit ring. */
export default function HeroArt() {
  return (
    <svg className="hero__art" viewBox="0 0 560 330" role="img" aria-label="A website being assembled from draggable blocks">
      <defs>
        <linearGradient id="ha-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a2d8f" /><stop offset="1" stopColor="#2a1658" /></linearGradient>
        <linearGradient id="ha-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a1560" /><stop offset="1" stopColor="#170a38" /></linearGradient>
        <linearGradient id="ha-img" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a67bff" /><stop offset="1" stopColor="#6a3df0" /></linearGradient>
        <linearGradient id="ha-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#5b2fd0" /></linearGradient>
        <linearGradient id="ha-orbit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff4d94" /><stop offset="0.55" stopColor="#c04ae8" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
        <clipPath id="ha-imgclip"><rect x="18" y="54" width="150" height="108" rx="14" /></clipPath>
        <clipPath id="ha-lower"><rect x="0" y="235" width="560" height="120" /></clipPath>
        <filter id="ha-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#7c3aed" floodOpacity="0.45" /></filter>
      </defs>

      {/* orbit – back half */}
      <g transform="rotate(-6 280 235)">
        <ellipse cx="280" cy="235" rx="250" ry="58" fill="none" stroke="url(#ha-orbit)" strokeWidth="3" opacity="0.5" />
      </g>

      <g className="float">
        {/* browser window */}
        <g transform="translate(46 52) skewY(-6)" filter="url(#ha-shadow)">
          <rect x="-12" y="12" width="304" height="196" rx="20" fill="url(#ha-side)" />
          <rect width="304" height="196" rx="20" fill="url(#ha-win)" stroke="rgba(255,255,255,0.14)" />
          <path d="M0 36H304" stroke="rgba(255,255,255,0.1)" />
          <circle cx="24" cy="18" r="5.5" fill="#ff5f57" /><circle cx="44" cy="18" r="5.5" fill="#febc2e" /><circle cx="64" cy="18" r="5.5" fill="#28c840" />
          <rect x="18" y="54" width="150" height="108" rx="14" fill="url(#ha-img)" />
          <g clipPath="url(#ha-imgclip)">
            <circle cx="62" cy="88" r="12" fill="rgba(255,255,255,0.5)" />
            <path d="M10 170L72 108L108 144L132 120L180 170Z" fill="rgba(255,255,255,0.3)" />
          </g>
          <rect x="184" y="58" width="96" height="9" rx="4.5" fill="#a98bff" opacity="0.9" />
          <rect x="184" y="78" width="70" height="9" rx="4.5" fill="#8465f2" opacity="0.8" />
          <rect x="184" y="124" width="72" height="28" rx="9" fill="#7b4df0" />
          <rect x="198" y="136" width="44" height="5" rx="2.5" fill="#fff" opacity="0.9" />
        </g>

        {/* cursor card */}
        <g transform="translate(312 22) rotate(8)" filter="url(#ha-shadow)">
          <rect width="76" height="76" rx="18" fill="url(#ha-card)" stroke="rgba(255,255,255,0.28)" />
          <path d="M26 20V54L35 46L41 59L49 55.5L43 43H55Z" fill="#fff" stroke="#e6dcff" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      </g>

      {/* orbit – front half */}
      <g transform="rotate(-6 280 235)" clipPath="url(#ha-lower)">
        <ellipse cx="280" cy="235" rx="250" ry="58" fill="none" stroke="url(#ha-orbit)" strokeWidth="3.5" />
      </g>

      {/* add-block card */}
      <g className="float" style={{ animationDelay: '-3s' }}>
        <g transform="translate(362 172) rotate(-4)" filter="url(#ha-shadow)">
          <rect width="150" height="118" rx="20" fill="#3a1d86" stroke="rgba(255,255,255,0.2)" />
          <rect x="14" y="14" width="122" height="90" rx="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="7 7" />
          <path d="M75 42V76M58 59H92" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>

      {/* sparkles */}
      {[[58, 205, 1], [520, 150, 0.8], [492, 30, 0.7], [20, 120, 0.6]].map(([x, y, s], i) => (
        <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0-9Q0 0 9 0Q0 0 0 9Q0 0-9 0Q0 0 0-9Z" fill="#c4b5fd" opacity="0.85" />
      ))}
    </svg>
  );
}
