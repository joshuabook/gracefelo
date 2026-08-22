import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import SkeletonLoader from '../components/SkeletonLoader'

// Simplified Bible data structure - will be populated from JSON files
const bibleBooks = {
  oldTestament: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ],
  newTestament: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
    '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ]
}

const OfflineBible = () => {
  const [language, setLanguage] = useState('english') // 'english' or 'amharic'
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapterContent, setChapterContent] = useState([])
  const [loading, setLoading] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    // Check if Bible is cached for offline use
    const checkOfflineStatus = async () => {
      try {
        const cache = await caches.open('grace-bible-cache')
        const cachedBible = await cache.match('/bible-data/english.json')
        setOfflineReady(!!cachedBible)
      } catch (error) {
        console.error('Error checking offline status:', error)
      }
    }

    checkOfflineStatus()
    loadBookmarks()
  }, [])

  const loadBookmarks = () => {
    const saved = localStorage.getItem('bible_bookmarks')
    if (saved) {
      setBookmarks(JSON.parse(saved))
    }
  }

  const saveBookmark = (verse) => {
    const newBookmark = {
      id: Date.now(),
      book: selectedBook,
      chapter: selectedChapter,
      verse: verse.verse,
      text: verse.text,
      language,
      timestamp: new Date().toISOString(),
    }
    const updated = [...bookmarks, newBookmark]
    setBookmarks(updated)
    localStorage.setItem('bible_bookmarks', JSON.stringify(updated))
    toast.success('Bookmark saved!')
  }

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(b => b.id !== id)
    setBookmarks(updated)
    localStorage.setItem('bible_bookmarks', JSON.stringify(updated))
    toast.success('Bookmark removed')
  }

  const loadChapter = async (book, chapter) => {
    setLoading(true)
    setSelectedBook(book)
    setSelectedChapter(chapter)

    try {
      // Simulate loading chapter content
      // In production, this would load from IndexedDB or JSON files
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate sample verses for demonstration
      const verses = Array.from({ length: 20 }, (_, i) => ({
        verse: i + 1,
        text: language === 'english' 
          ? `This is verse ${i + 1} of ${book} chapter ${chapter}. The word of God is living and active.`
          : `ይህ የ${book} ምዕራፍ ${chapter} ቁጥር ${i + 1} ነው። የእግዚአብሔር ቃል ሕያው ነው።`
      }))
      
      setChapterContent(verses)
    } catch (error) {
      console.error('Error loading chapter:', error)
      toast.error('Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }

  const downloadOffline = async () => {
    toast.loading('Downloading Bible for offline use...')
    
    try {
      // In production, this would download the actual Bible JSON
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.dismiss()
      toast.success('Bible downloaded for offline use!')
      setOfflineReady(true)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download Bible')
    }
  }

  const changeFontSize = (delta) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)))
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-4">
            📖 Offline Bible
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Read God's Word anytime, anywhere
          </p>
        </motion.div>

        {/* Language Selector */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setLanguage('english')}
            className={`px-6 py-3 rounded-lg font-medium ${
              language === 'english' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            English (WEB)
          </button>
          <button
            onClick={() => setLanguage('amharic')}
            className={`px-6 py-3 rounded-lg font-medium ${
              language === 'amharic' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            አማርኛ (Amharic)
          </button>
        </div>

        {/* Offline Status */}
        <div className="glass-card p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${offlineReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              {offlineReady ? 'Available Offline' : 'Online Only'}
            </span>
          </div>
          {!offlineReady && (
            <button onClick={downloadOffline} className="text-purple-600 hover:underline text-sm">
              ⬇️ Download for Offline
            </button>
          )}
        </div>

        {/* Font Size Controls */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => changeFontSize(-2)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            A-
          </button>
          <span className="px-4 py-2 text-sm">{fontSize}px</span>
          <button
            onClick={() => changeFontSize(2)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            A+
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Book List */}
          <div className="glass-card p-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-heading font-bold mb-4">Old Testament</h3>
            <div className="space-y-1 mb-6">
              {bibleBooks.oldTestament.map((book) => (
                <button
                  key={book}
                  onClick={() => loadChapter(book, 1)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedBook === book
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-purple-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {book}
                </button>
              ))}
            </div>

            <h3 className="font-heading font-bold mb-4">New Testament</h3>
            <div className="space-y-1">
              {bibleBooks.newTestament.map((book) => (
                <button
                  key={book}
                  onClick={() => loadChapter(book, 1)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedBook === book
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-purple-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {book}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Content */}
          <div className="md:col-span-2">
            {loading ? (
              <SkeletonLoader type="text" />
            ) : selectedBook ? (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-heading font-bold mb-4">
                  {selectedBook} {selectedChapter}
                </h2>
                
                {/* Chapter Navigation */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => loadChapter(selectedBook, Math.max(1, selectedChapter - 1))}
                    disabled={selectedChapter === 1}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <span className="px-4 py-2">Chapter {selectedChapter}</span>
                  <button
                    onClick={() => loadChapter(selectedBook, selectedChapter + 1)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  >
                    Next →
                  </button>
                </div>

                {/* Verses */}
                <div className="space-y-4">
                  {chapterContent.map((verse) => (
                    <div key={verse.verse} className="flex gap-3 group">
                      <span className="text-xs text-purple-600 font-bold mt-1">
                        {verse.verse}
                      </span>
                      <p style={{ fontSize: `${fontSize}px` }} className="flex-1">
                        {verse.text}
                      </p>
                      <button
                        onClick={() => saveBookmark(verse)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Bookmark this verse"
                      >
                        🔖
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-heading font-bold mb-2">
                  Select a Book
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a book from the list to start reading
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-heading font-bold mb-4">🔖 Your Bookmarks</h3>
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="glass-card p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{bookmark.book} {bookmark.chapter}:{bookmark.verse}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{bookmark.text}</p>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OfflineBible
