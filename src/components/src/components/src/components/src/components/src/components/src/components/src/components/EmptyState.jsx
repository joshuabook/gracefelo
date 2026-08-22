import React from 'react'
import { motion } from 'framer-motion'

const EmptyState = ({ icon = '📖', title = 'No Content Found', description = 'There is nothing to display here yet.' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-heading font-bold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </motion.div>
  )
}

export default EmptyState
