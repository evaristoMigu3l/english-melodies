import { useState, useEffect, useRef } from 'react'
import './MusicPlayer.css'

function MusicPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [player, setPlayer] = useState(null)
  const iframeRef = useRef(null)

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  const videoId = getYouTubeId(audioUrl)
  const isYouTube = !!videoId

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isYouTube) return

    // Load the YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        const ytPlayer = new window.YT.Player(iframeRef.current, {
          videoId: videoId,
          height: '220',
          width: '100%',
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              setPlayer(event.target)
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
            }
          }
        })
      }
    }

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      if (player) {
        player.destroy()
      }
    }
  }, [videoId, isYouTube])

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo()
      } else {
        player.playVideo()
      }
    }
  }

  // For non-YouTube URLs, use regular audio
  if (!isYouTube) {
    return (
      <div className="music-player">
        <audio controls src={audioUrl} className="audio-player">
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  return (
    <div className="music-player">
      <div className="player-wrapper">
        <div ref={iframeRef} id="youtube-player"></div>
      </div>

      <div className="controls">
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
      </div>

      <p className="source-label">🎥 Playing from YouTube</p>
    </div>
  )
}

export default MusicPlayer
