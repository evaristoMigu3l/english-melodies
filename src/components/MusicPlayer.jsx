import { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import './MusicPlayer.css'

const getYouTubeId = (url) => {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]{11})/)
  return match ? match[1] : null
}

function MusicPlayer({ audioUrl }) {
  const [launched, setLaunched] = useState(false)

  const videoId = getYouTubeId(audioUrl)
  const isYouTube = !!videoId

  // Non-YouTube: plain audio element
  if (!isYouTube) {
    return (
      <div className="music-player">
        <audio controls src={audioUrl} className="audio-player">
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&color=white`

  return (
    <div className="music-player">
      <div className="player-stage">
        {!launched ? (
          <div className="player-thumbnail" onClick={() => setLaunched(true)}>
            <img src={thumbUrl} alt="Video thumbnail" className="thumb-img" />
            <div className="thumb-overlay">
              <button className="thumb-play-btn" aria-label="Play video">
                <Play size={36} strokeWidth={0} fill="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          <div className="iframe-wrapper">
            <iframe
              src={embedUrl}
              title="YouTube player"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MusicPlayer
