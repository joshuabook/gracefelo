import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Loading from './components/Loading'
import AdPopup from './components/AdPopup'
import { motion, AnimatePresence } from 'framer-motion'

const Home = lazy(() => import('./pages/Home'))
const BibleVerses = lazy(() => import('./pages/BibleVerses'))
const OfflineBible = lazy(() => import('./pages/OfflineBible'))
const Books = lazy(() => import('./pages/Books'))
const Courses = lazy(() => import('./pages/Courses'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Puzzles = lazy(() => import('./pages/Puzzles'))
const Chat = lazy(() => import('./pages/Chat'))
const Posts = lazy(() => import('./pages/Posts'))
const Flyers = lazy(() => import('./pages/Flyers'))
const Blog = lazy(() => import('./pages/Blog'))
const Churches = lazy(() => import('./pages/Churches'))
const PrayerWall = lazy(() => import('./pages/PrayerWall'))
const Leadership = lazy(() => import('./pages/Leadership'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Notes = lazy(() => import('./pages/Notes'))
const About = lazy(() => import('./pages/About'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const ShareApp = lazy(() => import('./pages/ShareApp'))
const Support = lazy(() => import('./pages/Support'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Loading />
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  
  if (loading) return <Loading />
  
  if (!profile?.is_admin) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300 flex flex-col">
        <Navbar />
        <AdPopup />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/verses" element={<BibleVerses />} />
                <Route path="/bible" element={<OfflineBible />} />
                <Route path="/books" element={<Books />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/puzzles" element={<Puzzles />} />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/posts" element={<Posts />} />
                <Route path="/flyers" element={<Flyers />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/churches" element={<Churches />} />
                <Route path="/prayer" element={<PrayerWall />} />
                <Route path="/leadership" element={<Leadership />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/notes" element={
                  <ProtectedRoute>
                    <Notes />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/share-app" element={<ShareApp />} />
                <Route path="/support" element={<Support />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />
                <Route path="/login" element={<Login />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
