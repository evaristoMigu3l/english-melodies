import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Save, Music, Link as LinkIcon, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './AddSongPage.css'

function AddSongPage() {
  const navigate = useNavigate()
  const [songTitle, setSongTitle] = useState('')
  const [songUrl, setSongUrl] = useState('')
  const [combinedLyrics, setCombinedLyrics] = useState('')
  const [saving, setSaving] = useState(false)

  const parseLyrics = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const result = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.startsWith('[')) {
        continue
      }
      
      const originalLine = line
      let pronunciationLine = ''
      
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('[')) {
        pronunciationLine = lines[i + 1].trim().replace(/^\[|\]$/g, '')
        i++
      }
      
      result.push({
        original: originalLine,
        pronunciation: pronunciationLine
      })
    }
    
    return result
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const lyrics = parseLyrics(combinedLyrics)
      
      if (lyrics.length === 0) {
        alert('Could not parse any lyrics. Make sure you have at least one line of text.')
        setSaving(false)
        return
      }

      const songData = { 
        title: songTitle.trim() || 'Untitled Song',
        audio_url: songUrl.trim(), 
        lyrics
      }
      
      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        alert(`Failed to save song: ${error.message}`)
        setSaving(false)
        return
      }
      
      localStorage.setItem('currentSong', JSON.stringify(data))
      navigate('/')
    } catch (err) {
      console.error('Unexpected error:', err)
      alert(`Something went wrong: ${err.message}`)
      setSaving(false)
    }
  }

  return (
    <div className="add-song-page">
      <header className="page-header">
        <div className="header-title">
          <PlusCircle size={32} strokeWidth={2} color="var(--accent-primary)" />
          <h1>Add New Song</h1>
        </div>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="song-form">
          <div className="form-group">
            <label>
              <Music size={18} strokeWidth={1.5} color="var(--accent-primary)" />
              Song Title
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="e.g., Hello - Adele"
            />
          </div>

          <div className="form-group">
            <label>
              <LinkIcon size={18} strokeWidth={1.5} color="var(--accent-primary)" />
              YouTube or Audio URL
            </label>
            <input
              type="text"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FileText size={18} strokeWidth={1.5} color="var(--accent-primary)" />
              Lyrics with Pronunciation
            </label>
            <p className="helper-text">
              Original line, then pronunciation in [brackets]:
            </p>
            <textarea
              value={combinedLyrics}
              onChange={(e) => setCombinedLyrics(e.target.value)}
              placeholder={`Hello, it's me\n[rê-lo, its mi]\n\nI was wondering if after all these years\n[ai uas uén-der-ring if áf-ter ôl diz yers]`}
              rows="14"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={saving}>
            <Save size={20} strokeWidth={1.5} />
            {saving ? 'Saving...' : 'Save & Play'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddSongPage
