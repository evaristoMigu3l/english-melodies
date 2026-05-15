import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, BookOpen, Award, Zap, LogOut, Calendar, Mail } from 'lucide-react'
import './ProfilePage.css'

function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [savedVocabs, setSavedVocabs] = useState([])
  const [savedQuizzes, setSavedQuizzes] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState('vocabs')

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    setLoadingData(true)
    try {
      const [vocabRes, quizRes] = await Promise.all([
        supabase
          .from('saved_vocabularies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('saved_quizzes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (vocabRes.data) setSavedVocabs(vocabRes.data)
      if (quizRes.data) setSavedQuizzes(quizRes.data)
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const deleteVocab = async (id) => {
    const { error } = await supabase
      .from('saved_vocabularies')
      .delete()
      .eq('id', id)

    if (!error) {
      setSavedVocabs(prev => prev.filter(v => v.id !== id))
    }
  }

  const deleteQuiz = async (id) => {
    const { error } = await supabase
      .from('saved_quizzes')
      .delete()
      .eq('id', id)

    if (!error) {
      setSavedQuizzes(prev => prev.filter(q => q.id !== id))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-banner">
          <div className="banner-gradient"></div>
        </div>
        <div className="profile-info-section">
          <div className="profile-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} referrerPolicy="no-referrer" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="profile-details">
            <h1>{profile?.display_name || 'User'}</h1>
            <div className="profile-meta">
              <span className="meta-item">
                <Mail size={14} />
                {profile?.email || user?.email}
              </span>
              <span className="meta-item">
                <Calendar size={14} />
                Joined {profile?.created_at ? formatDate(profile.created_at) : 'Recently'}
              </span>
            </div>
          </div>
          <button className="signout-btn" onClick={handleSignOut}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="profile-stats">
        <div className="stat-card">
          <Zap size={24} />
          <div className="stat-info">
            <span className="stat-value">{profile?.generations_used || 0} / {profile?.generation_limit || 1}</span>
            <span className="stat-label">Generations Used</span>
          </div>
        </div>
        <div className="stat-card">
          <BookOpen size={24} />
          <div className="stat-info">
            <span className="stat-value">{savedVocabs.length}</span>
            <span className="stat-label">Saved Vocabularies</span>
          </div>
        </div>
        <div className="stat-card">
          <Award size={24} />
          <div className="stat-info">
            <span className="stat-value">{savedQuizzes.length}</span>
            <span className="stat-label">Quiz Results</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'vocabs' ? 'active' : ''}`}
          onClick={() => setActiveTab('vocabs')}
        >
          <BookOpen size={18} />
          My Vocabularies
        </button>
        <button
          className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          <Award size={18} />
          Quiz Results
        </button>
      </div>

      <div className="tab-content">
        {loadingData ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your data...</p>
          </div>
        ) : activeTab === 'vocabs' ? (
          savedVocabs.length === 0 ? (
            <div className="empty-tab">
              <BookOpen size={48} />
              <h3>No Saved Vocabularies</h3>
              <p>Generate vocabulary from a song to see it here!</p>
            </div>
          ) : (
            <div className="saved-items-list">
              {savedVocabs.map(vocab => (
                <div key={vocab.id} className="saved-item-card">
                  <div className="saved-item-header">
                    <div>
                      <h3>{vocab.song_title}</h3>
                      <span className="saved-date">{formatDate(vocab.created_at)}</span>
                    </div>
                    <button className="delete-item-btn" onClick={() => deleteVocab(vocab.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="vocab-preview-list">
                    {vocab.vocab_data?.map((item, idx) => (
                      <div key={idx} className="vocab-preview-item">
                        <span className="vocab-preview-word">{item.word}</span>
                        <span className="vocab-preview-pos">{item.partOfSpeech}</span>
                        <span className="vocab-preview-def">{item.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          savedQuizzes.length === 0 ? (
            <div className="empty-tab">
              <Award size={48} />
              <h3>No Quiz Results</h3>
              <p>Take a quiz after generating vocabulary to see your results here!</p>
            </div>
          ) : (
            <div className="saved-items-list">
              {savedQuizzes.map(quiz => (
                <div key={quiz.id} className="saved-item-card quiz-result-card">
                  <div className="saved-item-header">
                    <div>
                      <h3>{quiz.song_title}</h3>
                      <span className="saved-date">{formatDate(quiz.created_at)}</span>
                    </div>
                    <div className="quiz-score-badge">
                      <span className="quiz-score-num">{quiz.quiz_score}</span>
                      <span className="quiz-score-total">/ {quiz.total_questions}</span>
                    </div>
                  </div>
                  <div className="quiz-score-bar">
                    <div
                      className="quiz-score-fill"
                      style={{ width: `${(quiz.quiz_score / quiz.total_questions) * 100}%` }}
                    ></div>
                  </div>
                  <button className="delete-item-btn" onClick={() => deleteQuiz(quiz.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default ProfilePage
