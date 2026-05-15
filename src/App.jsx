import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import AddSongPage from './pages/AddSongPage'
import PlaylistPage from './pages/PlaylistPage'
import VocabularyPage from './pages/VocabularyPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import './App.css'

function AppLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute><AddSongPage /></ProtectedRoute>
          } />
          <Route path="/playlist" element={
            <ProtectedRoute><PlaylistPage /></ProtectedRoute>
          } />
          <Route path="/vocabulary" element={
            <ProtectedRoute><VocabularyPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
