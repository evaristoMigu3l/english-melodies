import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import AddSongPage from './pages/AddSongPage'
import PlaylistPage from './pages/PlaylistPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddSongPage />} />
            <Route path="/playlist" element={<PlaylistPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
