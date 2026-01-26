import { useState } from 'react'
import './SongForm.css'

function SongForm({ onSongSubmit }) {
  const [songUrl, setSongUrl] = useState('')
  const [combinedLyrics, setCombinedLyrics] = useState('')

  const parseLyrics = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const result = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check if line starts with [ - it's a pronunciation line
      if (line.startsWith('[')) {
        continue // Skip, already processed with previous line
      }
      
      // This is an original lyrics line
      const originalLine = line
      let pronunciationLine = ''
      
      // Check if next line is pronunciation (starts with [)
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('[')) {
        pronunciationLine = lines[i + 1].trim().replace(/^\[|\]$/g, '')
        i++ // Skip the pronunciation line in next iteration
      }
      
      result.push({
        original: originalLine,
        pronunciation: pronunciationLine
      })
    }
    
    return result
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const lyrics = parseLyrics(combinedLyrics)
    onSongSubmit({ audioUrl: songUrl, lyrics })
  }

  return (
    <div className="song-form-container">
      <h2>🎤 Add Your Song</h2>
      <form onSubmit={handleSubmit} className="song-form">
        <div className="form-group">
          <label>YouTube or Audio URL</label>
          <input
            type="text"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            required
          />
        </div>

        <div className="form-group">
          <label>Lyrics with Pronunciation</label>
          <p className="helper-text">
            Paste lyrics in this format - original line, then pronunciation in [brackets]:
          </p>
          <textarea
            value={combinedLyrics}
            onChange={(e) => setCombinedLyrics(e.target.value)}
            placeholder={`Hello world, how are you?
[Heh-LOH wurld, hau ar iu?]

I am fine, thank you!
[Ai em fain, thenk iu!]`}
            rows="12"
            required
          />
        </div>

        <button type="submit" className="submit-button">
          🎵 Load Song
        </button>
      </form>
    </div>
  )
}

export default SongForm
