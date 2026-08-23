import { useState, useEffect } from "react";
import { downloadMusic, getLibrary, getStreamUrl } from "../api";

function LandingPage({ onNavigateToLibrary }) {
  const [titleInput, setTitleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'loading', message: string, lastTitle?: string, lastFilename?: string }
  const [recentDownloads, setRecentDownloads] = useState([]);

  useEffect(() => {
    fetchRecentDownloads();
  }, []);

  const fetchRecentDownloads = async () => {
    try {
      const data = await getLibrary();
      setRecentDownloads(data.slice(0, 5)); // show latest 5
    } catch {
      // quiet fail for initial load
    }
  };

  const handleDownload = async (e) => {
    if (e) e.preventDefault();
    const query = titleInput.trim();
    if (!query) return;

    setLoading(true);
    setStatus({
      type: "loading",
      message: `Fetching and processing "${query}" via SpotDL... Please wait.`,
    });

    try {
      const res = await downloadMusic(query);
      setStatus({
        type: "success",
        message: res.message || `Successfully downloaded "${query}"!`,
        lastTitle: query,
      });
      setTitleInput("");
      fetchRecentDownloads();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to download song. Please check your backend connection or query.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetText) => {
    setTitleInput(presetText);
  };

  return (
    <div className="landing-page">
      {/* Hero Header */}
      <div className="hero">
        <div className="hero-pill">
          <span>✨</span> SpotDL Powered Audio Downloader
        </div>
        <h1 className="hero-title">Download Any Music in High Quality</h1>
        <p className="hero-subtitle">
          Enter a song title, artist, Spotify link, or YouTube URL below to download directly to your local library via the <code>/api/download-music</code> endpoint.
        </p>
      </div>

      {/* Download Input Card */}
      <div className="download-card">
        <form onSubmit={handleDownload}>
          <div className="input-group">
            <div className="input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="download-input"
                placeholder="Enter song title, artist (e.g. 'Starboy - The Weeknd' or Spotify link)..."
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                disabled={loading}
              />
              {titleInput && !loading && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setTitleInput("")}
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !titleInput.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Download MP3</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Presets */}
        <div className="presets">
          <span className="preset-label">Quick Presets:</span>
          {[
            "Blinding Lights - The Weeknd",
            "Shape of You - Ed Sheeran",
            "Flowers - Miley Cyrus",
            "Yellow - Coldplay",
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handlePresetClick(preset)}
              disabled={loading}
            >
              + {preset}
            </button>
          ))}
        </div>

        {/* Status Box */}
        {status && (
          <div className={`status-box ${status.type}`}>
            <div className="status-header">
              {status.type === "loading" && <span className="spinner"></span>}
              {status.type === "success" && <span>🎉</span>}
              {status.type === "error" && <span>⚠️</span>}
              <span>{status.message}</span>
            </div>

            {status.type === "success" && recentDownloads.length > 0 && (
              <div className="audio-preview-container">
                <p style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "0.4rem" }}>
                  Latest Download Preview:
                </p>
                <audio
                  controls
                  className="audio-preview"
                  src={getStreamUrl(recentDownloads[0].filename)}
                  autoPlay
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature Cards Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Fast SpotDL Engine</h3>
          <p>Asynchronously executes SpotDL on the backend to download metadata and MP3 audio in seconds.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💾</div>
          <h3>Local Directory Storage</h3>
          <p>Saves all downloaded track files to your local music directory configured via environment variables.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎧</div>
          <h3>Built-in Player</h3>
          <p>Stream your downloaded songs immediately directly inside your web application built-in player.</p>
        </div>
      </div>

      {/* Recent Downloads Section */}
      {recentDownloads.length > 0 && (
        <div className="recent-section">
          <div className="section-title">
            <span>Recent Downloads</span>
            <button
              className="action-btn"
              onClick={onNavigateToLibrary}
              style={{ fontSize: "0.85rem" }}
            >
              View Full Library ({recentDownloads.length}) →
            </button>
          </div>

          <div className="song-list">
            {recentDownloads.map((song) => (
              <div key={song.id} className="song-card">
                <div className="song-left">
                  <div className="song-disc">🎵</div>
                  <div className="song-details">
                    <div className="song-name">{song.title}</div>
                    <div className="song-meta">
                      {(song.size_bytes / (1024 * 1024)).toFixed(2)} MB • MP3 Audio
                    </div>
                  </div>
                </div>
                <div className="song-actions">
                  <audio controls src={getStreamUrl(song.filename)} style={{ height: "36px", maxWidth: "220px" }} />
                  <a
                    href={getStreamUrl(song.filename)}
                    download={song.filename}
                    className="action-btn"
                  >
                    ⬇ Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>SoundVault • spotDL Powered Music API</p>
      </footer>
    </div>
  );
}

export default LandingPage;
