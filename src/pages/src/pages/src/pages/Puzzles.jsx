import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const Puzzles = () => {
  const [activePuzzle, setActivePuzzle] = useState(null)
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const puzzleTypes = [
    { id: 'wordsearch', icon: '🔍', title: 'Word Search', desc: 'Find Bible words', color: 'from-purple-500 to-indigo-600' },
    { id: 'crossword', icon: '✏️', title: 'Crossword', desc: 'Solve Bible clues', color: 'from-blue-500 to-cyan-600' },
    { id: 'memory', icon: '🧠', title: 'Memory Verse', desc: 'Match the verses', color: 'from-green-500 to-emerald-600' },
    { id: 'unscramble', icon: '🔤', title: 'Unscramble', desc: 'Arrange the words', color: 'from-orange-500 to-amber-600' },
    { id: 'trivia', icon: '❓', title: 'Trivia', desc: 'Test your knowledge', color: 'from-red-500 to-pink-600' },
  ]

  const wordSearchPuzzle = {
    grid: [
      ['G', 'R', 'A', 'C', 'E', 'L', 'O', 'V'],
      ['O', 'P', 'E', 'A', 'C', 'E', 'H', 'F'],
      ['D', 'F', 'A', 'I', 'T', 'H', 'O', 'A'],
      ['L', 'O', 'V', 'E', 'J', 'O', 'P', 'I'],
      ['H', 'O', 'P', 'E', 'K', 'L', 'E', 'T'],
      ['J', 'O', 'Y', 'M', 'N', 'Y', 'B', 'H'],
      ['P', 'R', 'A', 'Y', 'E', 'R', 'S', 'T'],
      ['W', 'I', 'S', 'D', 'O', 'M', 'Q', 'Z'],
    ],
    words: ['GRACE', 'PEACE', 'FAITH', 'LOVE', 'HOPE', 'JOY', 'PRAYER', 'WISDOM']
  }

  const [selectedCells, setSelectedCells] = useState([])
  const [foundWords, setFoundWords] = useState([])

  const startWordSearch = () => {
    setActivePuzzle('wordsearch')
    setSelectedCells([])
    setFoundWords([])
  }

  const handleCellClick = (row, col) => {
    const cellIndex = `${row}-${col}`
    if (selectedCells.includes(cellIndex)) {
      setSelectedCells(selectedCells.filter(c => c !== cellIndex))
    } else {
      setSelectedCells([...selectedCells, cellIndex])
    }
  }

  const checkWord = () => {
    // Simple check - in production, this would validate the selected word
    const selectedWord = selectedCells
      .map(cell => {
        const [row, col] = cell.split('-').map(Number)
        return wordSearchPuzzle.grid[row][col]
      })
      .join('')

    if (wordSearchPuzzle.words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      setFoundWords([...foundWords, selectedWord])
      setSelectedCells([])
      setScore(score + 10)
      toast.success(`Found "${selectedWord}"!`)
      
      if (foundWords.length + 1 === wordSearchPuzzle.words.length) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success('Puzzle Complete! 🎉')
      }
    } else if (foundWords.includes(selectedWord)) {
      toast.error('Already found this word!')
    } else {
      toast.error('Not a valid word. Try again!')
    }
  }

  const memoryVerses = [
    { verse: 'John 3:16', text: 'For God so loved the world...' },
    { verse: 'Psalm 23:1', text: 'The Lord is my shepherd...' },
    { verse: 'Phil 4:13', text: 'I can do all things...' },
    { verse: 'Prov 3:5', text: 'Trust in the Lord...' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-4">
            🧩 Bible Puzzles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Have fun while learning God's Word
          </p>
        </motion.div>

        {/* Score Display */}
        <div className="glass-card p-4 mb-8 text-center">
          <span className="text-2xl font-bold text-purple-600">Score: {score}</span>
          {streak > 0 && <span className="ml-4">🔥 Streak: {streak}</span>}
        </div>

        {!activePuzzle && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {puzzleTypes.map((puzzle) => (
              <motion.button
                key={puzzle.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => puzzle.id === 'wordsearch' && startWordSearch()}
                className={`bg-gradient-to-br ${puzzle.color} p-6 rounded-2xl text-white text-left`}
              >
                <div className="text-4xl mb-3">{puzzle.icon}</div>
                <h3 className="font-heading text-xl font-bold">{puzzle.title}</h3>
                <p className="text-sm opacity-90">{puzzle.desc}</p>
              </motion.button>
            ))}
          </div>
        )}

        {activePuzzle === 'wordsearch' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-heading font-bold">Word Search</h3>
              <button onClick={() => setActivePuzzle(null)} className="text-gray-500">
                ✕ Close
              </button>
            </div>

            {/* Words to Find */}
            <div className="flex flex-wrap gap-2 mb-6">
              {wordSearchPuzzle.words.map((word) => (
                <span
                  key={word}
                  className={`px-3 py-1 rounded-full text-sm ${
                    foundWords.includes(word)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Word Search Grid */}
            <div className="grid grid-cols-8 gap-1 mb-6">
              {wordSearchPuzzle.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`
                  const isSelected = selectedCells.includes(cellKey)
                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-10 h-10 flex items-center justify-center font-bold rounded ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900'
                      }`}
                    >
                      {cell}
                    </button>
                  )
                })
              )}
            </div>

            <button onClick={checkWord} className="btn-primary w-full">
              Check Word
            </button>
          </motion.div>
        )}

        {/* Memory Verses Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-heading font-bold mb-6 text-center">
            📖 Memory Verses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memoryVerses.map((item, index) => (
              <motion.div
                key={item.verse}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <h4 className="font-heading font-bold text-purple-600 mb-2">{item.verse}</h4>
                <p className="text-gray-600 dark:text-gray-400">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Puzzles
