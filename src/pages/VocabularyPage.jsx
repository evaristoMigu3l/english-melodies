import { useState, useEffect } from 'react'
import { BookOpen, RefreshCw, HelpCircle, CheckCircle2, XCircle, Save, Zap, Music, ArrowLeft } from 'lucide-react'
import { extractVocabularyFromLyrics } from '../lib/gemini'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import './VocabularyPage.css'

function VocabularyPage() {
  const { user, profile, canGenerate, refreshProfile } = useAuth()
  const [songs, setSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [vocabItems, setVocabItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSongs, setLoadingSongs] = useState(true)
  const [error, setError] = useState(null)
  const [quizMode, setQuizMode] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existingVocab, setExistingVocab] = useState(null)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    setLoadingSongs(true)
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setSongs(data)
    if (error) console.error('Error fetching songs:', error)
    setLoadingSongs(false)
  }

  const selectSong = async (song) => {
    setSelectedSong(song)
    setVocabItems([])
    setError(null)
    setSaved(false)
    setExistingVocab(null)
    setQuizMode(false)

    // Check if vocab already exists for this song+user
    if (user) {
      const { data } = await supabase
        .from('saved_vocabularies')
        .select('*')
        .eq('user_id', user.id)
        .eq('song_id', song.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        setExistingVocab(data[0])
        setVocabItems(data[0].vocab_data)
        setSaved(true)
      }
    }
  }

  const generateVocab = async () => {
    if (!selectedSong || !selectedSong.lyrics) return

    if (!canGenerate()) {
      setError(`You've used all your generation credits (${profile.generations_used}/${profile.generation_limit}). Contact the admin to get more.`)
      return
    }

    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const lyricsText = Array.isArray(selectedSong.lyrics)
        ? selectedSong.lyrics.map(line => typeof line === 'object' ? line.original : line).join('\n')
        : String(selectedSong.lyrics)
      const truncated = lyricsText.slice(0, 1500)
      const data = await extractVocabularyFromLyrics(truncated)
      setVocabItems(data)

      // Refresh profile to sync generation count (edge function incremented server-side)
      refreshProfile()

    } catch (err) {
      setError(err.message || 'Failed to generate vocabulary')
    } finally {
      setLoading(false)
    }
  }

  const saveVocab = async () => {
    if (!user || !selectedSong || vocabItems.length === 0) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('saved_vocabularies')
        .insert({
          user_id: user.id,
          song_id: selectedSong.id,
          song_title: selectedSong.title,
          vocab_data: vocabItems,
        })

      if (error) throw error
      setSaved(true)
    } catch (err) {
      console.error('Error saving vocabulary:', err)
      setError('Failed to save vocabulary')
    } finally {
      setSaving(false)
    }
  }

  const saveQuizResult = async () => {
    if (!user || !selectedSong) return

    try {
      await supabase
        .from('saved_quizzes')
        .insert({
          user_id: user.id,
          song_id: selectedSong.id,
          song_title: selectedSong.title,
          quiz_score: quizScore,
          total_questions: vocabItems.length,
          vocab_data: vocabItems,
        })
    } catch (err) {
      console.error('Error saving quiz result:', err)
    }
  }

  const startQuiz = () => {
    setQuizMode(true)
    setCurrentQuizIndex(0)
    setQuizScore(0)
    setQuizFinished(false)
    setUserAnswer('')
    setFeedback(null)
  }

  const checkAnswer = () => {
    const currentItem = vocabItems[currentQuizIndex]
    const isCorrect = userAnswer.toLowerCase().trim() === currentItem.word.toLowerCase().trim()

    setFeedback({
      isCorrect,
      correctAnswer: currentItem.word
    })

    const newScore = isCorrect ? quizScore + 1 : quizScore
    if (isCorrect) {
      setQuizScore(prev => prev + 1)
    }

    setTimeout(() => {
      if (currentQuizIndex < vocabItems.length - 1) {
        setCurrentQuizIndex(prev => prev + 1)
        setUserAnswer('')
        setFeedback(null)
      } else {
        setQuizFinished(true)
        // Save quiz result when finished
        const finalScore = isCorrect ? newScore : quizScore
        // We need to call save with the right score
        saveQuizResultDirect(isCorrect ? quizScore + 1 : quizScore)
      }
    }, 2000)
  }

  const saveQuizResultDirect = async (finalScore) => {
    if (!user || !selectedSong) return
    try {
      await supabase
        .from('saved_quizzes')
        .insert({
          user_id: user.id,
          song_id: selectedSong.id,
          song_title: selectedSong.title,
          quiz_score: finalScore,
          total_questions: vocabItems.length,
          vocab_data: vocabItems,
        })
    } catch (err) {
      console.error('Error saving quiz result:', err)
    }
  }

  const getYouTubeThumb = (url) => {
    if (!url) return null
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = (match && match[7].length === 11) ? match[7] : null
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  }

  // Song selection view
  if (!selectedSong) {
    return (
      <div className="vocab-page">
        <header className="page-header">
          <div className="header-title">
            <BookOpen size={32} strokeWidth={2} color="var(--accent-primary)" />
            <h1>Vocabulary Builder</h1>
          </div>
          <div className="generation-badge">
            <Zap size={16} strokeWidth={2} />
            <span>{profile?.generations_used || 0} / {profile?.generation_limit || 1} generations used</span>
          </div>
        </header>

        <div className="song-selection">
          <h2>Choose a Song</h2>
          <p className="selection-desc">Select a song from your playlist to generate vocabulary from its lyrics.</p>

          {loadingSongs ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading songs...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: '3rem' }}>
              <Music size={64} strokeWidth={1.5} className="empty-icon" />
              <h2>No Songs Available</h2>
              <p>No songs are available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="song-select-grid">
              {songs.map(song => (
                <button
                  key={song.id}
                  className="song-select-card"
                  onClick={() => selectSong(song)}
                >
                  <div className="song-select-thumb">
                    {getYouTubeThumb(song.audio_url) ? (
                      <img src={getYouTubeThumb(song.audio_url)} alt={song.title} />
                    ) : (
                      <Music size={36} strokeWidth={1.5} color="var(--accent-primary)" />
                    )}
                  </div>
                  <div className="song-select-info">
                    <h3>{song.title || 'Untitled'}</h3>
                    <span>{Array.isArray(song.lyrics) ? song.lyrics.length : 0} lines</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main vocab view for selected song
  return (
    <div className="vocab-page">
      <header className="page-header">
        <div className="header-title">
          <button className="back-btn" onClick={() => setSelectedSong(null)}>
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          <BookOpen size={32} strokeWidth={2} color="var(--accent-primary)" />
          <h1>Vocabulary: {selectedSong.title}</h1>
        </div>
        <div className="generation-badge">
          <Zap size={16} strokeWidth={2} />
          <span>{profile?.generations_used || 0} / {profile?.generation_limit || 1} used</span>
        </div>
      </header>

      {vocabItems.length === 0 && !loading && !error && (
        <div className="generate-section">
          {existingVocab ? (
            <p>Loading your saved vocabulary...</p>
          ) : canGenerate() ? (
            <>
              <p>Extract useful vocabulary words and phrases from this song using AI.</p>
              <p className="generation-warning">
                ⚡ You have {(profile?.generation_limit || 1) - (profile?.generations_used || 0)} generation{(profile?.generation_limit || 1) - (profile?.generations_used || 0) !== 1 ? 's' : ''} remaining.
              </p>
              <button className="primary-btn" onClick={generateVocab}>
                <RefreshCw size={18} strokeWidth={2} className="btn-icon" />
                Generate Vocabulary
              </button>
            </>
          ) : (
            <>
              <p className="limit-reached">🔒 You've reached your generation limit.</p>
              <p>Contact the administrator to increase your limit.</p>
            </>
          )}
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing lyrics and extracting vocabulary...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          {canGenerate() && (
            <button className="primary-btn" onClick={generateVocab}>Try Again</button>
          )}
        </div>
      )}

      {!quizMode && vocabItems.length > 0 && (
        <div className="vocab-content">
          <div className="vocab-actions">
            {!saved && (
              <button className="save-btn" onClick={saveVocab} disabled={saving}>
                <Save size={18} strokeWidth={2} className="btn-icon" />
                {saving ? 'Saving...' : 'Save Vocabulary'}
              </button>
            )}
            {saved && <span className="saved-indicator"><CheckCircle2 size={18} strokeWidth={2} /> Saved!</span>}
            <button className="secondary-btn" onClick={startQuiz}>
              <HelpCircle size={18} strokeWidth={2} className="btn-icon" />
              Take a Quiz
            </button>
          </div>
          <div className="cards-grid">
            {vocabItems.map((item, index) => (
              <div key={index} className="vocab-card">
                <div className="vocab-word">
                  <div className="word-header-info">
                    <h3>{item.word}</h3>
                    {item.pronunciation && <span className="pronunciation">{item.pronunciation}</span>}
                  </div>
                  <span className="pos">{item.partOfSpeech}</span>
                </div>
                <div className="vocab-definition">
                  <p><strong>Definição:</strong> {item.definition}</p>
                  <p className="example-sentence">
                    &ldquo;{(item.example || '').split(/\*\*([^*]+)\*\*/).map((part, i) =>
                      i % 2 === 1
                        ? <mark key={i} className="vocab-highlight">{part}</mark>
                        : part
                    )}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quizMode && vocabItems.length > 0 && (
        <div className="quiz-container">
          {quizFinished ? (
            <div className="quiz-results">
              <h2>Quiz Completed!</h2>
              <div className="score-display">
                <span className="score">{quizScore}</span> / {vocabItems.length}
              </div>
              <p>{quizScore === vocabItems.length ? 'Perfect score! Amazing!' : 'Great effort! Keep practicing.'}</p>
              <div className="quiz-actions">
                <button className="primary-btn" onClick={startQuiz}>Try Again</button>
                <button className="secondary-btn" onClick={() => setQuizMode(false)}>Back to List</button>
              </div>
            </div>
          ) : (
            <div className="quiz-card">
              <div className="quiz-progress">
                Question {currentQuizIndex + 1} of {vocabItems.length}
              </div>
              <div className="quiz-question">
                <h3>What is the word for:</h3>
                <p className="definition-hint">{vocabItems[currentQuizIndex].definition}</p>
              </div>
              <div className="quiz-input-section">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the word..."
                  disabled={feedback !== null}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && feedback === null) checkAnswer()
                  }}
                />
                <button
                  className="primary-btn"
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim() || feedback !== null}
                >
                  Submit
                </button>
              </div>
              {feedback && (
                <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                  {feedback.isCorrect ? (
                    <><CheckCircle2 size={20} strokeWidth={2}/> Correct!</>
                  ) : (
                    <><XCircle size={20} strokeWidth={2}/> Incorrect. The correct answer is: {feedback.correctAnswer}</>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VocabularyPage
