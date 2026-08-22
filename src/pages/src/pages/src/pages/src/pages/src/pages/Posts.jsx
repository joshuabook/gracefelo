import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shareSupabase } from '../lib/supabase'
import { uploadImage, uploadFile } from '../lib/cloudinary'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postType, setPostType] = useState('text')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observer = useRef()
  const { user, profile } = useAuth()

  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    try {
      let query = shareSupabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url, full_name)
        `)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 10, pageNum * 10 - 1)

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error } = await query

      if (error) throw error

      if (data.length < 10) {
        setHasMore(false)
      }

      if (reset) {
        setPosts(data)
      } else {
        setPosts(prev => [...prev, ...data])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filter])

  useEffect(() => {
    fetchPosts(1, true)
  }, [filter, fetchPosts])

  const lastPostRef = useCallback(node => {
    if (loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true)
        setPage(prev => {
          const nextPage = prev + 1
          fetchPosts(nextPage)
          return nextPage
        })
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, hasMore, fetchPosts])

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to share posts')
      return
    }

    if (!content.trim() && !file && !linkUrl.trim()) {
      toast.error('Please add content to share')
      return
    }

    // Check daily limits
    const today = new Date().toDateString()
    const savedCount = localStorage.getItem(`post_count_${today}`)
    const currentCount = savedCount ? parseInt(savedCount) : 0

    if (postType === 'book' && currentCount >= 3) {
      toast.error('Daily book upload limit reached (3/day). Save some for tomorrow! 📚')
      return
    }
    if (postType === 'image' && currentCount >= 5) {
      toast.error('Daily image upload limit reached (5/day).')
      return
    }
    if (postType === 'voice' && currentCount >= 3) {
      toast.error('Daily voice note limit reached (3/day).')
      return
    }

    setUploading(true)
    try {
      let postContent = content
      
      if (file) {
        if (postType === 'image') {
          postContent = await uploadImage(file, true)
        } else {
          postContent = await uploadFile(file, true)
        }
      } else if (postType === 'link' && linkUrl) {
        postContent = linkUrl
      }

      const { data, error } = await shareSupabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            type: postType,
            content: postContent,
            file_name: file?.name,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      setPosts([data[0], ...posts])
      setContent('')
      setLinkUrl('')
      setFile(null)
      
      // Update daily count
      localStorage.setItem(`post_count_${today}`, (currentCount + 1).toString())
      
      toast.success('Post shared successfully!')
    } catch (error) {
      console.error('Error sharing post:', error)
      toast.error('Failed to share post')
    } finally {
      setUploading(false)
    }
  }

  const likePost = async (postId) => {
    if (!user) {
      toast.error('Please sign in to like posts')
      return
    }

    try {
      const { data: existingLike } = await shareSupabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        await shareSupabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      } else {
        await shareSupabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }])
      }

      fetchPosts(1, true)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const reportPost = async (postId) => {
    if (!user) {
      toast.error('Please sign in to report posts')
      return
    }

    const reason = prompt('Please provide a reason for reporting this post:')
    if (!reason) return

    try {
      await shareSupabase.from('post_reports').insert([
        {
          post_id: postId,
          reporter_id: user.id,
          reason: reason,
        },
      ])
      toast.success('Post reported. Our team will review it.')
    } catch (error) {
      console.error('Error reporting post:', error)
      toast.error('Failed to report post')
    }
  }

  const shareToSocial = (post, platform) => {
    const shareUrl = window.location.href
    const shareText = post.content.substring(0, 100)
    
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

  const copyLink = (postId) => {
    const url = `${window.location.origin}/posts#${postId}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-heading font-bold gradient-text mb-4">
            📱 Community Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share books, images, links, and more
          </p>
        </motion.div>

        {/* Share Form */}
        {user && (
          <div className="glass-card p-6 mb-8">
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setPostType('text')}
                className={`px-4 py-2 rounded-lg text-sm ${postType === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                📝 Text
              </button>
              <button
                onClick={() => setPostType('book')}
                className={`px-4 py-2 rounded-lg text-sm ${postType === 'book' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                📚 Book
              </button>
              <button
                onClick={() => setPostType('image')}
                className={`px-4 py-2 rounded-lg text-sm ${postType === 'image' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                🖼️ Image
              </button>
              <button
                onClick={() => setPostType('link')}
                className={`px-4 py-2 rounded-lg text-sm ${postType === 'link' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                🔗 Link
              </button>
              <button
                onClick={() => setPostType('voice')}
                className={`px-4 py-2 rounded-lg text-sm ${postType === 'voice' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                🎤 Voice
              </button>
            </div>

            <div className="space-y-4">
              {postType === 'text' && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  className="input-field resize-none"
                />
              )}
              
              {postType === 'link' && (
                <>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Paste link (YouTube, article, etc.)"
                    className="input-field"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add description (optional)"
                    rows="2"
                    className="input-field resize-none"
                  />
                </>
              )}
              
              {(postType === 'book' || postType === 'image') && (
                <>
                  <input
                    type="file"
                    accept={postType === 'book' ? '.pdf,.epub' : 'image/*'}
                    onChange={(e) => setFile(e.target.files[0])}
                    className="input-field"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add description (optional)"
                    rows="2"
                    className="input-field resize-none"
                  />
                </>
              )}
              
              {postType === 'voice' && (
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Voice recording coming soon. Use text for now.
                  </p>
                </div>
              )}

              <button
                onClick={handleShare}
                disabled={uploading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {uploading ? 'Sharing...' : 'Share Post'}
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {['all', 'text', 'book', 'image', 'link', 'voice'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${filter === type ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{post.profiles?.username}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => reportPost(post.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Report"
                  >
                    ⚠️
                  </button>
                </div>

                {/* Post Content */}
                {post.type === 'text' && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
                )}

                {post.type === 'image' && (
                  <img
                    src={post.content}
                    alt="Post"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}

                {post.type === 'book' && (
                  <a
                    href={post.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center mb-4 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    📚 {post.file_name || 'Download Book'}
                  </a>
                )}

                {post.type === 'link' && (
                  <div className="mb-4">
                    {post.content.includes('youtube.com') || post.content.includes('youtu.be') ? (
                      <div className="relative">
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(post.content)}/maxresdefault.jpg`}
                          alt="Video"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">▶</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={post.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg"
                      >
                        <div className="p-4">
                          <p className="text-sm text-purple-600 mb-1">🔗 External Link</p>
                          <p className="font-medium">{post.content}</p>
                        </div>
                      </a>
                    )}
                    {content && <p className="mt-2 text-gray-600 dark:text-gray-400">{post.content}</p>}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`flex items-center space-x-1 ${post.likes_count > 0 ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <span>❤️</span>
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <div className="flex space-x-2">
                    <button onClick={() => shareToSocial(post, 'whatsapp')} title="Share on WhatsApp">
                      📱
                    </button>
                    <button onClick={() => shareToSocial(post, 'facebook')} title="Share on Facebook">
                      👍
                    </button>
                    <button onClick={() => shareToSocial(post, 'telegram')} title="Share on Telegram">
                      ✈️
                    </button>
                    <button onClick={() => copyLink(post.id)} title="Copy Link">
                      🔗
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {loadingMore && <SkeletonLoader type="card" />}
          </div>
        ) : (
          <EmptyState
            icon="📱"
            title="No Posts Yet"
            description="Be the first to share something!"
          />
        )}
      </div>
    </div>
  )
}

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export default Posts
