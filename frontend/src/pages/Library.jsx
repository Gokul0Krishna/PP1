import { useEffect, useState } from "react";
import { getLibrary, removeSong } from "../api";
import SongCard from "../components/SongCard";

function Library() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const data = await getLibrary();
      setSongs(data);
    } catch (err) {
      setMessage("Failed to load your library.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await removeSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setMessage("Failed to remove that song.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="page">
      <h1>Your Library</h1>
      {loading && <p className="message">Loading...</p>}
      {message && <p className="message">{message}</p>}
      {!loading && songs.length === 0 && (
        <p className="message">No songs downloaded yet — head to Home and search for something.</p>
      )}

      <div className="song-list">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            actionLabel={removingId === song.id ? "Removing..." : "Remove"}
            disabled={removingId === song.id}
            onAction={() => handleRemove(song.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Library;
