function SongCard({ song, onAction, actionLabel, disabled }) {
  return (
    <div className="song-card">
      <img src={song.cover} alt={song.title} />
      <div className="song-info">
        <p className="song-title">{song.title}</p>
        <p className="song-artist">{song.artist}</p>
        <p className="song-duration">{song.duration}</p>
      </div>
      <button onClick={onAction} disabled={disabled}>
        {actionLabel}
      </button>
    </div>
  );
}

export default SongCard;
