import { useEffect, useState } from "react";
import { getLibrary, getStreamUrl } from "../api";

function Library({ onNavigateToLanding }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLibrary();
      setSongs(data);
    } catch (err) {
      setError("Failed to load your music library. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="library-page">
      <div className="section-title" style={{ marginTop: "1rem" }}>
        <div>
          <h2>Your Downloaded Library</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "normal", marginTop: "0.2rem" }}>
            All MP3 files saved in your target music directory.
          </p>
        </div>
        <button className="action-btn" onClick={loadLibrary} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div className="status-box loading">
          <div className="status-header">
            <span className="spinner"></span>
            <span>Loading library files...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="status-box error">
          <div className="status-header">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && songs.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "2.5rem" }}>🎵</div>
          <h3>No Songs Downloaded Yet</h3>
          <p>Head over to the Downloader landing page and type a song name to download music.</p>
          <button
            className="submit-btn"
            style={{ marginTop: "1.5rem" }}
            onClick={onNavigateToLanding}
          >
            Go to Downloader →
          </button>
        </div>
      )}

      {!loading && songs.length > 0 && (
        <div className="song-list">
          {songs.map((song) => (
            <div key={song.id} className="song-card">
              <div className="song-left">
                <div className="song-disc">🎧</div>
                <div className="song-details">
                  <div className="song-name">{song.title}</div>
                  <div className="song-meta">
                    {(song.size_bytes / (1024 * 1024)).toFixed(2)} MB • {new Date(song.created_at * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="song-actions">
                <audio controls src={getStreamUrl(song.filename)} style={{ height: "36px", maxWidth: "250px" }} />
                <a
                  href={getStreamUrl(song.filename)}
                  download={song.filename}
                  className="action-btn"
                >
                  ⬇ Save
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Library;

