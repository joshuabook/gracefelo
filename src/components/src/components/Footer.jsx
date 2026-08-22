import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">✝️</span>
              <div>
                <span className="font-heading text-xl font-bold">Grace Christian</span>
                <span className="block text-xs text-gray-400">Platform</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Your daily companion for Bible verses, Christian books, courses, and community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/verses" className="text-gray-400 hover:text-white transition-colors">Bible Verses</Link></li>
              <li><Link to="/bible" className="text-gray-400 hover:text-white transition-colors">Offline Bible</Link></li>
              <li><Link to="/books" className="text-gray-400 hover:text-white transition-colors">Books Library</Link></li>
              <li><Link to="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
              <li><Link to="/puzzles" className="text-gray-400 hover:text-white transition-colors">Puzzles</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link to="/chat" className="text-gray-400 hover:text-white transition-colors">Global Chat</Link></li>
              <li><Link to="/posts" className="text-gray-400 hover:text-white transition-colors">Posts</Link></li>
              <li><Link to="/flyers" className="text-gray-400 hover:text-white transition-colors">Gospel Flyers</Link></li>
              <li><Link to="/prayer" className="text-gray-400 hover:text-white transition-colors">Prayer Wall</Link></li>
              <li><Link to="/churches" className="text-gray-400 hover:text-white transition-colors">Churches</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/share-app" className="text-gray-400 hover:text-white transition-colors">Share App</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            App Powered by{' '}
            <a
              href="https://addispower.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Addis Power
            </a>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © {new Date().getFullYear()} Grace Christian Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
