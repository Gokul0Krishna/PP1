import { useState } from "react";
import { searchSongs, downloadSong } from "../api";
import SongCard from "../components/SongCard";

function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadedIds, setDownloadedIds] = useState(new Set());
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await searchSongs(query);
      setResults(data);
      if (data.length === 0) setMessage("No songs found. Try a different search.");
    } catch (err) {
      setMessage("Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (song) => {
    setDownloadingId(song.id);
    setMessage("");
    try {
      await downloadSong(song);
      setDownloadedIds((prev) => new Set(prev).add(song.id));
      setMessage(`"${song.title}" was added to your library.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page">
      <h1>Search Music</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="message">Searching...</p>}
      {message && <p className="message">{message}</p>}

      <div className="song-list">
        {results.map((song) => {
          const isDownloading = downloadingId === song.id;
          const isDownloaded = downloadedIds.has(song.id);
          return (
            <SongCard
              key={song.id}
              song={song}
              actionLabel={isDownloading ? "Downloading..." : isDownloaded ? "Added" : "Download"}
              disabled={isDownloading || isDownloaded}
              onAction={() => handleDownload(song)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Home;
