import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getDailyVerse } from '../lib/bibleApi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const [dailyVerse, setDailyVerse] = useState(null)
  const [stats, setStats] = useState({ users: 0, verses: 0, books: 0 })
  const [featuredBooks, setFeaturedBooks] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetchDailyVerse()
    fetchStats()
    fetchFeaturedBooks()
  }, [])

  const fetchDailyVerse = async () => {
    const verse = await getDailyVerse()
    setDailyVerse(verse)
  }

  const fetchStats = async () => {
    try {
      const [usersCount, versesCount, booksCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('bible_verses').select('id', { count: 'exact' }),
        supabase.from('books').select('id', { count: 'exact' }),
      ])

      setStats({
        users: usersCount.count || 0,
        verses: versesCount.count || 0,
        books: booksCount.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchFeaturedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(3)
        .order('downloads_count', { ascending: false })

      if (error) throw error
      setFeaturedBooks(data || [])
    } catch (error) {
      console.error('Error fetching featured books:', error)
    }
  }

  const navCards = [
    { to: '/bible', icon: '📖', title: 'Read Bible', desc: 'English & Amharic', color: 'from-purple-500 to-indigo-600' },
    { to: '/verses', icon: '✨', title: 'Daily Verse', desc: 'Inspiration daily', color: 'from-gold-400 to-yellow-600' },
    { to: '/books', icon: '📚', title: 'Books Library', desc: 'Christian books', color: 'from-blue-500 to-cyan-600' },
    { to: '/courses', icon: '🎓', title: 'Courses', desc: 'Learn & grow', color: 'from-green-500 to-emerald-600' },
    { to: '/quiz', icon: '🎯', title: 'Quiz', desc: 'Test knowledge', color: 'from-red-500 to-pink-600' },
    { to: '/puzzles', icon: '🧩', title: 'Puzzles', desc: 'Bible games', color: 'from-orange-500 to-amber-600' },
    { to: '/posts', icon: '📱', title: 'Posts', desc: 'Community feed', color: 'from-violet-500 to-purple-600' },
    { to: '/flyers', icon: '🕊️', title: 'Gospel Flyers', desc: 'Share the Word', color: 'from-pink-500 to-rose-600' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold gradient-text mb-4">
            Welcome to Grace Christian Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Your daily companion for spiritual growth and community
          </p>
          {user ? (
            <p className="text-lg text-purple-600 dark:text-purple-400">
              Welcome back, {user.user_metadata?.full_name || user.user_metadata?.username || 'Friend'}! 🙏
            </p>
          ) : (
            <Link to="/login" className="btn-primary text-lg">
              Join Our Community
            </Link>
          )}
        </motion.div>

        {/* Daily Verse */}
        {dailyVerse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 mb-12 text-center"
          >
            <span className="text-sm text-gold-500 font-semibold uppercase tracking-wider">
              📖 Daily Verse
            </span>
            <blockquote className="text-2xl md:text-3xl font-heading font-semibold my-4">
              "{dailyVerse.text}"
            </blockquote>
            <cite className="text-gray-600 dark:text-gray-400">
              — {dailyVerse.reference}
            </cite>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.users}+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Members</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.verses}+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verses</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.books}+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Books</div>
          </div>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {navCards.map((card, index) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={card.to}
                className={`block bg-gradient-to-br ${card.color} p-6 rounded-2xl text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-200 h-full`}
              >
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className="font-heading text-lg font-bold">{card.title}</h3>
                <p className="text-sm opacity-90">{card.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold gradient-text mb-6 text-center">
              📚 Featured Books
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <h3 className="font-heading text-xl font-bold mb-2">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{book.author}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description}</p>
                  <Link to="/books" className="text-purple-600 dark:text-purple-400 font-medium">
                    View Library →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center glass-card p-8"
        >
          <h2 className="text-3xl font-heading font-bold mb-4">
            🙏 Join Our Community Today
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect with believers, share your faith, and grow together.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/prayer" className="btn-primary">Prayer Wall</Link>
            <Link to="/churches" className="btn-secondary">Find Churches</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
