import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import SkeletonLoader from '../components/SkeletonLoader'

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [category, setCategory] = useState('all')
  const [leaderboard, setLeaderboard] = useState([])
  const { user } = useAuth()

  const categories = ['All', 'Bible', 'Science', 'History', 'Geography', 'General Knowledge']

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    if (quizStarted && !quizFinished && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizStarted && !quizFinished) {
      handleTimeout()
    }
  }, [timeLeft, quizStarted, quizFinished])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          *,
          profiles:user_id (username, full_name)
        `)
        .order('score', { ascending: false })
        .limit(10)

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const startQuiz = async () => {
    try {
      let query = supabase.from('quizzes').select('*')
      if (category !== 'all') {
        query = query.eq('category', category)
      }
      
      const { data, error } = await query.limit(10)
      if (error) throw error

      if (!data || data.length === 0) {
        toast.error('No questions available for this category')
        return
      }

      // Shuffle questions
      const shuffled = data.sort(() => Math.random() - 0.5)
      setQuestions(shuffled)
      setCurrentQuestion(0)
      setScore(0)
      setStreak(0)
      setBestStreak(0)
      setTimeLeft(30)
      setQuizStarted(true)
      setQuizFinished(false)
      setSelectedAnswer(null)
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast.error('Failed to start quiz')
    }
  }

  const handleAnswer = async (answer) => {
    if (selectedAnswer) return
    setSelectedAnswer(answer)

    const question = questions[currentQuestion]
    const isCorrect = answer === question.correct_answer
    
    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
      }
      
      // Calculate points based on difficulty
      const difficultyPoints = {
        'Easy': 10,
        'Medium': 20,
        'Hard': 30,
      }
      const basePoints = difficultyPoints[question.category] || 10
      const streakBonus = Math.floor(newStreak / 3) * 5
      const timeBonus = Math.floor(timeLeft / 5)
      const totalPoints = basePoints + streakBonus + timeBonus
      
      setScore(score + totalPoints)
      toast.success(`Correct! +${totalPoints} points`)
    } else {
      setStreak(0)
      toast.error('Incorrect answer')
    }

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(30)
      } else {
        finishQuiz()
      }
    }, 1500)
  }

  const handleTimeout = () => {
    setStreak(0)
    toast.error('Time\'s up!')
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTimeLeft(30)
      } else {
        finishQuiz()
      }
    }, 1500)
  }

  const finishQuiz = async () => {
    setQuizFinished(true)
    setQuizStarted(false)
    
    // Celebration
    if (score > 50) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }

    // Save result
    if (user) {
      try {
        const { error } = await supabase
          .from('quiz_results')
          .insert([
            {
              user_id: user.id,
              score: score,
              total_questions: questions.length,
            },
          ])

        if (error) throw error
        fetchLeaderboard()
      } catch (error) {
        console.error('Error saving quiz result:', error)
      }
    }
  }

  const shareScore = () => {
    const text = `I scored ${score} points on Grace Christian Platform Quiz! Can you beat me? 🎯`
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Score',
        text: text,
      })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Score copied to clipboard!')
    }
  }

  if (quizStarted && questions.length > 0) {
    const question = questions[currentQuestion]
    
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            {/* Timer and Progress */}
            <div className="flex justify-between mb-6">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                ⏱️ {timeLeft}s
              </span>
            </div>

            {/* Timer Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
              <div
                className="h-2 bg-purple-600 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            {/* Score and Streak */}
            <div className="flex justify-between mb-6">
              <span className="text-sm">Score: {score}</span>
              <span className="text-sm">🔥 Streak: {streak}</span>
            </div>

            {/* Question */}
            <h2 className="text-xl font-heading font-bold mb-6">{question.question}</h2>

            {/* Options */}
            <div className="space-y-3">
              {JSON.parse(question.options || '[]').map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedAnswer === option
                      ? option === question.correct_answer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="text-6xl mb-4">
              {score >= 100 ? '🏆' : score >= 50 ? '🎉' : '💪'}
            </div>
            <h2 className="text-3xl font-heading font-bold mb-4">Quiz Complete!</h2>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              Your Score: {score}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Best Streak: {bestStreak} 🔥
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={startQuiz} className="btn-primary">
                Play Again
              </button>
              <button onClick={shareScore} className="btn-secondary">
                Share Score
              </button>
            </div>
          </motion.div>
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
            🎯 Bible Quiz
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Test your knowledge and earn points
          </p>
        </motion.div>

        {/* Category Selection */}
        <div className="glass-card p-6 mb-8">
          <h3 className="font-heading font-bold mb-4 text-center">Select Category</h3>
          <div className="flex flex-wrap gap-2 justify-center">
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
          <button onClick={startQuiz} className="btn-primary w-full mt-6">
            Start Quiz
          </button>
        </div>

        {/* Leaderboard */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-bold mb-4 text-center">🏆 Leaderboard</h3>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-bold ${index < 3 ? 'text-gold-500' : ''}`}>
                      #{index + 1}
                    </span>
                    <span>{entry.profiles?.username || 'Anonymous'}</span>
                  </div>
                  <span className="font-bold">{entry.score} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No scores yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz
