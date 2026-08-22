import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'

const Books = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const { user } = useAuth()

  const categories = ['All', 'Theology', 'Devotional', 'Christian Living', 'Bible Study', 'Prayer', 'Biography', 'Youth']

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('downloads_count', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const downloadBook = async (book) => {
    if (!user) {
      toast.error('Please sign in to download books')
      return
    }

    try {
      // Increment download count
      const { error: updateError } = await supabase
        .from('books')
        .update({ downloads_count: (book.downloads_count || 0) + 1 })
        .eq('id', book.id)

      if (updateError) throw updateError

      // Open download link
      window.open(book.cloudinary_url, '_blank')
      toast.success('Download started!')
      
      // Update local state
      setBooks(books.map(b => 
        b.id === book.id 
          ? { ...b, downloads_count: (b.downloads_count || 0) + 1 }
          : b
      ))
    } catch (error) {
      console.error('Error downloading book:', error)
      toast.error('Failed to download book')
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === 'all' || category === 'All' || book.category === category
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-4">
            📚 Books Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Grow your faith through Christian literature
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field max-w-md mx-auto"
          />
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm ${
                  category === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-6 hover:shadow-2xl transition-shadow"
                >
                  <div className="mb-4">
                    {book.cloudinary_url ? (
                      <img
                        src={book.cloudinary_url}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-4xl">📖</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">by {book.author}</p>
                  {book.category && (
                    <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs mb-3">
                      {book.category}
                    </span>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      ⬇️ {book.downloads_count || 0} downloads
                    </span>
                    <button
                      onClick={() => downloadBook(book)}
                      className="btn-primary text-sm py-2"
                    >
                      Download
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="No Books Found"
            description="Try adjusting your search or filter criteria."
          />
        )}
      </div>
    </div>
  )
}

export default Books
