/** Sticky top bar used by Dashboard and Templates. */
export default function AppBar({ start, children }) {
  return (
    <nav className="appbar">
      {start}
      <div className="appbar__spacer" />
      {children}
    </nav>
  );
}
