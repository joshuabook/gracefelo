import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-20 right-4 z-50 ${bgColor[type]} text-white px-6 py-4 rounded-lg shadow-lg max-w-sm`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{icon[type]}</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </motion.div>
  )
}

export default Toast
