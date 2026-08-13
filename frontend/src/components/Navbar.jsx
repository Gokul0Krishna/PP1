function Navbar({ page, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">🎵 MusicApp</div>
      <div className="navbar-links">
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>
        <button
          className={page === "library" ? "active" : ""}
          onClick={() => onNavigate("library")}
        >
          Library
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
