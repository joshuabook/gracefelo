import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDailyVerse, getRandomVerse, searchVerses } from '../lib/bibleApi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'

const BibleVerses = () => {
  const [dailyVerse, setDailyVerse] = useState(null)
  const [randomVerse, setRandomVerse] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [activeTab, setActiveTab] = useState('daily')
  const { user } = useAuth()

  useEffect(() => {
    fetchDailyVerse()
    fetchFavorites()
    setLoading(false)
  }, [user])

  const fetchDailyVerse = async () => {
    const verse = await getDailyVerse()
    setDailyVerse(verse)
  }

  const fetchRandomVerse = async () => {
    const verse = await getRandomVerse()
    setRandomVerse(verse)
  }

  const fetchFavorites = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('favorite_verses')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setFavorites(data || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    const results = await searchVerses(searchQuery)
    setSearchResults(results)
  }

  const saveFavorite = async (verse) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      const { data, error } = await supabase
        .from('favorite_verses')
        .insert([
          {
            user_id: user.id,
            verse_text: verse.text,
            reference: verse.reference,
          },
        ])
        .select()

      if (error) throw error
      setFavorites([...favorites, data[0]])
      toast.success('Verse saved to favorites!')
    } catch (error) {
      console.error('Error saving favorite:', error)
      toast.error('Failed to save favorite')
    }
  }

  const shareVerse = (verse) => {
    const text = `"${verse.text}" - ${verse.reference} | Grace Christian Platform`
    if (navigator.share) {
      navigator.share({
        title: 'Bible Verse',
        text: text,
      })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Verse copied to clipboard!')
    }
  }

  const categories = ['Love', 'Faith', 'Hope', 'Strength', 'Wisdom', 'Peace', 'Courage']

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader type="text" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-4">
            Bible Verses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Daily inspiration from God's Word
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-2 rounded-lg ${
              activeTab === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Daily Verse
          </button>
          <button
            onClick={() => {
              setActiveTab('random')
              fetchRandomVerse()
            }}
            className={`px-6 py-2 rounded-lg ${
              activeTab === 'random' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Random Verse
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded-lg ${
              activeTab === 'search' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Search
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-2 rounded-lg ${
                activeTab === 'favorites' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'daily' && dailyVerse && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8 text-center"
            >
              <span className="text-sm text-gold-500 font-semibold uppercase tracking-wider">
                📖 Today's Verse
              </span>
              <blockquote className="text-2xl md:text-3xl font-heading font-semibold my-6">
                "{dailyVerse.text}"
              </blockquote>
              <cite className="text-gray-600 dark:text-gray-400 block mb-6">
                — {dailyVerse.reference}
              </cite>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => saveFavorite(dailyVerse)}
                  className="btn-secondary"
                >
                  ❤️ Save
                </button>
                <button
                  onClick={() => shareVerse(dailyVerse)}
                  className="btn-primary"
                >
                  ↗️ Share
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'random' && randomVerse && (
            <motion.div
              key="random"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8 text-center"
            >
              <span className="text-sm text-gold-500 font-semibold uppercase tracking-wider">
                🎲 Random Verse
              </span>
              <blockquote className="text-2xl md:text-3xl font-heading font-semibold my-6">
                "{randomVerse.text}"
              </blockquote>
              <cite className="text-gray-600 dark:text-gray-400 block mb-6">
                — {randomVerse.reference}
              </cite>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={fetchRandomVerse}
                  className="btn-secondary"
                >
                  🎲 Another Verse
                </button>
                <button
                  onClick={() => shareVerse(randomVerse)}
                  className="btn-primary"
                >
                  ↗️ Share
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search verses (e.g., John 3:16, love, faith...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="input-field"
                />
                <button onClick={handleSearch} className="btn-primary">
                  Search
                </button>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((verse, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6"
                    >
                      <p className="mb-2">{verse.text}</p>
                      <p className="text-sm text-gray-500">— {verse.reference}</p>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery && (
                <EmptyState
                  icon="🔍"
                  title="No Results"
                  description="Try searching with a different phrase or book name."
                />
              )}
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <p className="mb-2">{fav.verse_text}</p>
                    <p className="text-sm text-gray-500">— {fav.reference}</p>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon="❤️"
                  title="No Favorites Yet"
                  description="Save your favorite verses to see them here."
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories */}
        <div className="mt-12">
          <h3 className="text-xl font-heading font-bold mb-4 text-center">Browse by Category</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSearchQuery(category)
                  setActiveTab('search')
                  handleSearch()
                }}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BibleVerses
