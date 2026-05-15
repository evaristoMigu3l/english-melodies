import { NavLink } from 'react-router-dom'
import { Music, ListMusic, PlusCircle, Mic2, BookOpen, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

function Sidebar() {
  const { profile } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Mic2 size={28} />
        <span>English Melodies</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Music size={20} />
          <span>Now Playing</span>
        </NavLink>
        
        <NavLink to="/playlist" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ListMusic size={20} />
          <span>Playlist</span>
        </NavLink>
        
        <NavLink to="/vocabulary" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Vocabulary</span>
        </NavLink>
        
        <NavLink to="/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} />
          <span>Add Song</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-user">
        <NavLink to="/profile" className={({ isActive }) => `user-card ${isActive ? 'active' : ''}`}>
          <div className="user-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} referrerPolicy="no-referrer" />
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{profile?.display_name || 'Profile'}</span>
            <span className="user-email">{profile?.email || ''}</span>
          </div>
        </NavLink>
      </div>
      
      <div className="sidebar-footer">
        <p>Learn English through music</p>
      </div>
    </aside>
  )
}

export default Sidebar
