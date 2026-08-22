import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shareSupabase } from '../lib/supabase'
import { uploadImage } from '../lib/cloudinary'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'

const Flyers = () => {
  const [flyers, setFlyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFlyer, setSelectedFlyer] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [category, setCategory] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const { user } = useAuth()

  const categories = [
    'All',
    'Jesus Saves',
    'Jesus Loves You',
    'Salvation',
    'Gospel Message',
    'Peace with God',
    'Come to Jesus',
    'Hope in Christ',
    'Revival',
  ]

  useEffect(() => {
    fetchFlyers()
  }, [category])

  const fetchFlyers = async () => {
    try {
      let query = shareSupabase
        .from('flyers')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      setFlyers(data || [])
    } catch (error) {
      console.error('Error fetching flyers:', error)
      toast.error('Failed to load flyers')
    } finally {
      setLoading(false)
    }
  }

  const uploadFlyer = async (files) => {
    if (!user) {
      toast.error('Please sign in to upload flyers')
      return
    }

    if (files.length > 5) {
      toast.error('Maximum 5 images per flyer')
      return
    }

    setUploading(true)
    try {
      const imageUrls = []
      for (const file of files) {
        const url = await uploadImage(file, true)
        imageUrls.push(url)
      }

      const { data, error } = await shareSupabase
        .from('flyers')
        .insert([
          {
            user_id: user.id,
            images: imageUrls,
            category: category === 'all' ? 'Gospel Message' : category,
            likes_count: 0,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      setFlyers([data[0], ...flyers])
      setShowUpload(false)
      toast.success('Flyer uploaded successfully!')
    } catch (error) {
      console.error('Error uploading flyer:', error)
      toast.error('Failed to upload flyer')
    } finally {
      setUploading(false)
    }
  }

  const likeFlyer = async (flyerId) => {
    if (!user) {
      toast.error('Please sign in to like flyers')
      return
    }

    try {
      const { data: existingLike } = await shareSupabase
        .from('flyer_likes')
        .select('*')
        .eq('flyer_id', flyerId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        await shareSupabase.from('flyer_likes').delete().eq('flyer_id', flyerId).eq('user_id', user.id)
      } else {
        await shareSupabase.from('flyer_likes').insert([{ flyer_id: flyerId, user_id: user.id }])
      }

      fetchFlyers()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const shareFlyer = (flyer, platform) => {
    const shareUrl = window.location.href
    const shareText = `Gospel Flyer - ${flyer.category} | Grace Christian Platform`
    
    let url = ''
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
      default:
        break
    }
    
    if (url) window.open(url, '_blank')
  }

  const downloadFlyer = (imageUrl) => {
    window.open(imageUrl, '_blank')
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-heading font-bold gradient-text mb-4">
            🕊️ Gospel Flyers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share the Good News of Jesus Christ
          </p>
        </motion.div>

        {/* Upload Button */}
        {user && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary"
            >
              {showUpload ? 'Cancel Upload' : '📤 Upload Flyer'}
            </button>
          </div>
        )}

        {/* Upload Form */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-6 mb-8"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              max="5"
              onChange={(e) => uploadFlyer(e.target.files)}
              disabled={uploading}
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-2">
              Upload up to 5 images. They will appear as a slideshow.
            </p>
          </motion.div>
        )}

        {/* Categories */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm ${category === cat ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Flyers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} type="image" />
            ))}
          </div>
        ) : flyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flyers.map((flyer) => (
              <motion.div
                key={flyer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
              >
                {/* Flyer Carousel */}
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <div
                    className="flex transition-transform duration-300"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {(flyer.images || []).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Flyer ${index + 1}`}
                        className="w-full h-64 object-cover flex-shrink-0"
                        onClick={() => setSelectedFlyer(flyer)}
                      />
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {flyer.images?.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentSlide(Math.min(flyer.images.length - 1, currentSlide + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full"
                      >
                        →
                      </button>
                    </>
                  )}
                  
                  {/* Slide Indicators */}
                  {flyer.images?.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {flyer.images.map((_, index) => (
                        <span
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Flyer Info */}
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                    {flyer.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(flyer.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => likeFlyer(flyer.id)}
                    className={`flex items-center space-x-1 ${flyer.likes_count > 0 ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <span>❤️</span>
                    <span>{flyer.likes_count || 0}</span>
                  </button>
                  <div className="flex space-x-2">
                    <button onClick={() => shareFlyer(flyer, 'whatsapp')}>📱</button>
                    <button onClick={() => shareFlyer(flyer, 'facebook')}>👍</button>
                    <button onClick={() => shareFlyer(flyer, 'telegram')}>✈️</button>
                    <button onClick={() => downloadFlyer(flyer.images[0])}>⬇️</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🕊️"
            title="No Flyers Yet"
            description="Share the Gospel with beautiful flyers."
          />
        )}
      </div>

      {/* Full Screen Flyer Modal */}
      <AnimatePresence>
        {selectedFlyer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setSelectedFlyer(null)}
          >
            <button
              onClick={() => setSelectedFlyer(null)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              ✕
            </button>
            <img
              src={selectedFlyer.images[currentSlide]}
              alt="Flyer"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Flyers
