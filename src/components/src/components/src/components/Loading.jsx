import React from 'react'
import { motion } from 'framer-motion'

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
      />
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-gray-600 dark:text-gray-400 font-medium"
      >
        Loading...
      </motion.p>
    </div>
  )
}

export default Loading
