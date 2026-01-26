import { NavLink } from 'react-router-dom'
import { Music, ListMusic, PlusCircle, Mic2 } from 'lucide-react'
import './Sidebar.css'

function Sidebar() {
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
        
        <NavLink to="/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} />
          <span>Add Song</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <p>Learn English through music</p>
      </div>
    </aside>
  )
}

export default Sidebar
