import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ListMusic, PlayCircle, Trash, Music, PlusCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './PlaylistPage.css'

function PlaylistPage() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching songs:', error)
    } else {
      setSongs(data || [])
    }
    setLoading(false)
  }

  const playSong = (song) => {
    localStorage.setItem('currentSong', JSON.stringify(song))
  }

  const deleteSong = async (id) => {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting song:', error)
    } else {
      setSongs(songs.filter(s => s.id !== id))
    }
  }

  const getYouTubeThumb = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = (match && match[7].length === 11) ? match[7] : null
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  }

  return (
    <div className="playlist-page">
      <header className="page-header">
        <div className="header-title">
          <ListMusic size={32} strokeWidth={2} color="var(--accent-primary)" />
          <h1>My Playlist</h1>
        </div>
        <p>{songs.length} song{songs.length !== 1 ? 's' : ''} saved</p>
      </header>

      {loading ? (
        <div className="loading">
          <span>Loading songs...</span>
        </div>
      ) : songs.length === 0 ? (
        <div className="empty-playlist">
          <Music size={64} strokeWidth={1.5} className="empty-icon" />
          <h2>No Songs Yet</h2>
          <p>Add your first song to build your playlist!</p>
          <Link to="/add" className="add-btn">
            <PlusCircle size={20} strokeWidth={2} />
            Add Song
          </Link>
        </div>
      ) : (
        <div className="songs-grid">
          {songs.map((song) => (
            <div key={song.id} className="song-card">
              <div className="song-thumbnail">
                {getYouTubeThumb(song.audio_url) ? (
                  <img src={getYouTubeThumb(song.audio_url)} alt={song.title} />
                ) : (
                  <div className="song-thumbnail-placeholder">
                    <Music size={40} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="song-info">
                <h3 className="song-name">{song.title || 'Untitled'}</h3>
                <span className="song-meta">{song.lyrics?.length || 0} lines</span>
              </div>
              <div className="song-actions">
                <Link 
                  to="/" 
                  className="action-btn btn-play"
                  onClick={() => playSong(song)}
                >
                  <PlayCircle size={18} strokeWidth={2} />
                  Play
                </Link>
                <button 
                  className="action-btn btn-delete"
                  onClick={() => deleteSong(song.id)}
                >
                  <Trash size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlaylistPage
