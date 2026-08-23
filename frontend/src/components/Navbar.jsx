function Navbar({ page, onNavigate, serverOnline }) {
  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => onNavigate("landing")} style={{ cursor: "pointer" }}>
        <div className="brand-icon">🎧</div>
        <span>SoundVault</span>
        <span className="status-badge">
          <span className="status-dot"></span>
          {serverOnline ? "API Online" : "Connecting..."}
        </span>
      </div>
      <nav className="navbar-links">
        <button
          className={`nav-btn ${page === "landing" ? "active" : ""}`}
          onClick={() => onNavigate("landing")}
        >
          <span>⚡</span> Downloader
        </button>
        <button
          className={`nav-btn ${page === "library" ? "active" : ""}`}
          onClick={() => onNavigate("library")}
        >
          <span>🎵</span> Library
        </button>
      </nav>
    </header>
  );
}

export default Navbar;

