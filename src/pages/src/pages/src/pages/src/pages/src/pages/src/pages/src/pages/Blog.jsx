import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const { user, profile } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id)
    }
  }, [selectedPost])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles:author_id (username, avatar_url, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url, full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const addComment = async () => {
    if (!comment.trim()) return
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert([
          {
            post_id: selectedPost.id,
            user_id: user.id,
            content: comment,
          },
        ])
        .select()

      if (error) throw error
      setComments([...comments, data[0]])
      setComment('')
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const likePost = async (postId) => {
    if (!user) {
      toast.error('Please sign in to like posts')
      return
    }

    try {
      const { data: existingLike } = await supabase
        .from('blog_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        await supabase.from('blog_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      } else {
        await supabase.from('blog_likes').insert([{ post_id: postId, user_id: user.id }])
      }

      fetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const sharePost = (post) => {
    const text = `${post.title} | Grace Christian Platform`
    const url = window.location.href
    
    if (navigator.share) {
      navigator.share({ title: post.title, text, url })
    } else {
      navigator.clipboard.writeText(`${text} ${url}`)
      toast.success('Link copied!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
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
            📖 Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Inspirational articles and teachings
          </p>
        </motion.div>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-shadow"
                onClick={() => setSelectedPost(post)}
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={post.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                    alt="Author"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{post.profiles?.full_name || post.profiles?.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-heading font-bold mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {post.excerpt || post.content.substring(0, 200)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      likePost(post.id)
                    }}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    <span>❤️</span>
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">Read More →</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sharePost(post)
                      }}
                      className="text-gray-500"
                    >
                      ↗️
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📖"
            title="No Blog Posts Yet"
            description="Check back soon for inspiring articles."
          />
        )}

        {/* Post Modal */}
        <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedPost(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="float-right text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                  
                  <h2 className="text-3xl font-heading font-bold mb-4">{selectedPost.title}</h2>
                  
                  {selectedPost.image_url && (
                    <img
                      src={selectedPost.image_url}
                      alt={selectedPost.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="prose dark:prose-invert max-w-none mb-8">
                    <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                  </div>
                  
                  {/* Comments Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-xl font-heading font-bold mb-4">
                      Comments ({comments.length})
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <img
                            src={comment.profiles?.avatar_url || 'https://via.placeholder.com/32'}
                            alt="User"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {comment.profiles?.full_name || comment.profiles?.username}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">{comment.content}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {user && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addComment()}
                          placeholder="Add a comment..."
                          className="input-field flex-1"
                        />
                        <button onClick={addComment} className="btn-primary">
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Blog
