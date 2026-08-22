import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const AdPopup = () => {
  const [showAd, setShowAd] = useState(false)
  const [adContent, setAdContent] = useState(null)

  useEffect(() => {
    const checkAndShowAd = () => {
      const lastAdTime = localStorage.getItem('last_ad_time')
      const now = Date.now()
      
      if (!lastAdTime || now - parseInt(lastAdTime) >= 30 * 60 * 1000) {
        fetchRandomAd()
        setShowAd(true)
        localStorage.setItem('last_ad_time', now.toString())
      }
    }

    // Delay first ad by 5 minutes
    const initialDelay = setTimeout(checkAndShowAd, 5 * 60 * 1000)
    
    // Check every 5 minutes
    const interval = setInterval(checkAndShowAd, 5 * 60 * 1000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [])

  const fetchRandomAd = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_ads')
        .select('*')
        .eq('active', true)
        .limit(1)

      if (error) throw error
      
      if (data && data.length > 0) {
        setAdContent(data[0])
      }
    } catch (error) {
      console.error('Error fetching ad:', error)
      // Fallback to default ad
      setAdContent({
        title: '📚 Explore Christian Books',
        description: 'Discover our collection of inspiring Christian literature.',
        button_text: 'Browse Books',
        link_url: '/books',
      })
    }
  }

  const closeAd = () => {
    setShowAd(false)
  }

  if (!showAd || !adContent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
        >
          <button
            onClick={closeAd}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Close"
          >
            ✕
          </button>
          
          <div className="text-center">
            <div className="text-5xl mb-4">{adContent.emoji || '📖'}</div>
            <h2 className="text-2xl font-heading font-bold mb-4">
              {adContent.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {adContent.description}
            </p>
            {adContent.link_url && (
              <a
                href={adContent.link_url}
                onClick={closeAd}
                className="btn-primary inline-block"
              >
                {adContent.button_text || 'Learn More'}
              </a>
            )}
            <button
              onClick={closeAd}
              className="block w-full mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              No thanks, maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdPopup
