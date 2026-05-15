import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Music, PlusCircle } from 'lucide-react'
import MusicPlayer from '../components/MusicPlayer'
import LyricsDisplay from '../components/LyricsDisplay'
import './HomePage.css'

function HomePage() {
  const [song, setSong] = useState(null)

  useEffect(() => {
    const savedSong = localStorage.getItem('currentSong')
    if (savedSong) setSong(JSON.parse(savedSong))
  }, [])

  return (
    <div className="home-page">
      {song ? (
        <>
          <div className="now-playing-header">
            <span className="now-playing-pulse" />
            <Music size={18} strokeWidth={2} color="var(--accent-primary)" />
            <span className="now-playing-label">Now Playing</span>
            <span className="song-title">{song.title || 'Untitled'}</span>
          </div>
          <div className="two-column-layout">
            <div className="player-column">
              <MusicPlayer audioUrl={song.audio_url || song.audioUrl} />
            </div>
            <div className="lyrics-column">
              <LyricsDisplay lyrics={song.lyrics} />
            </div>
          </div>
        </>
      ) : (
        <div className="no-song">
          <div className="no-song-content">
            <Music size={72} strokeWidth={1.5} className="no-song-icon" />
            <h2>No Song Loaded</h2>
            <p>Pick a song from your Playlist, or add a new one to start learning!</p>
            <Link to="/add" className="add-song-btn">
              <PlusCircle size={20} strokeWidth={2} />
              Add Your First Song
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
