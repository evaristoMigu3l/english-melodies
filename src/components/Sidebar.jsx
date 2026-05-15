import { NavLink } from 'react-router-dom'
import { Music, ListMusic, PlusCircle, Mic2, BookOpen, User, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Sidebar.css'

const navLinks = [
  { to: '/',           icon: Music,     label: 'Now Playing' },
  { to: '/playlist',   icon: ListMusic,  label: 'Playlist'    },
  { to: '/vocabulary', icon: BookOpen,   label: 'Vocabulary'  },
  { to: '/add',        icon: PlusCircle, label: 'Add Song'    },
]

function Sidebar() {
  const { profile } = useAuth()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Mic2 size={22} strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <span className="logo-title">English Melodies</span>
          <span className="logo-sub">Learn through music</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu</span>
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">
              <Icon size={18} strokeWidth={2} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="sidebar-user">
        <NavLink
          to="/profile"
          className={({ isActive }) => `user-card${isActive ? ' active' : ''}`}
        >
          <div className="user-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} referrerPolicy="no-referrer" />
            ) : (
              <User size={16} strokeWidth={2} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{profile?.display_name || 'Profile'}</span>
            <span className="user-email">{profile?.email || ''}</span>
          </div>
          <ChevronRight size={14} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
