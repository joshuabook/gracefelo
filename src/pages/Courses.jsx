import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [progress, setProgress] = useState({})
  const [filter, setFilter] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchCourses()
    if (user) {
      fetchProgress()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      
      const progressMap = {}
      data.forEach(item => {
        progressMap[item.course_id] = item
      })
      setProgress(progressMap)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const updateProgress = async (courseId, progressValue) => {
    if (!user) {
      toast.error('Please sign in to track progress')
      return
    }

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .upsert([
          {
            user_id: user.id,
            course_id: courseId,
            progress: progressValue,
            completed: progressValue === 100,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error
      
      setProgress({ ...progress, [courseId]: data[0] })
      toast.success('Progress updated!')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true
    if (filter === 'video') return course.youtube_video_id
    if (filter === 'text') return !course.youtube_video_id
    return true
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
            🎓 Bible Study Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Deepen your understanding through video and text courses
          </p>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-6 py-2 rounded-lg ${
              filter === 'video' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            🎥 Video Courses
          </button>
          <button
            onClick={() => setFilter('text')}
            className={`px-6 py-2 rounded-lg ${
              filter === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            📝 Text Courses
          </button>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-6 cursor-pointer hover:shadow-2xl transition-shadow"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="mb-4">
                    {course.youtube_video_id ? (
                      <img
                        src={`https://img.youtube.com/vi/${course.youtube_video_id}/maxresdefault.jpg`}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-4xl">📝</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {course.youtube_video_id ? '🎥 Video Course' : '📝 Text Course'}
                    </span>
                    {progress[course.id] && (
                      <div className="w-24">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-2 bg-purple-600 rounded-full"
                            style={{ width: `${progress[course.id].progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {progress[course.id].progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon="🎓"
            title="No Courses Available"
            description="Check back soon for new courses."
          />
        )}

        {/* Course Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="float-right text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                  <h2 className="text-2xl font-heading font-bold mb-4">{selectedCourse.title}</h2>
                  
                  {selectedCourse.youtube_video_id ? (
                    <div className="mb-6">
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedCourse.youtube_video_id}`}
                        title={selectedCourse.title}
                        className="w-full h-96 rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: selectedCourse.content || selectedCourse.description }} />
                    </div>
                  )}

                  {user && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">Progress:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress[selectedCourse.id]?.progress || 0}
                        onChange={(e) => updateProgress(selectedCourse.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="font-medium">
                        {progress[selectedCourse.id]?.progress || 0}%
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Courses
