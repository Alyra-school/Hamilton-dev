import React from 'react'
import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-bold text-white animate-pulse">404</h1>
        <h2 className="text-3xl font-semibold text-gray-300">Oups ! Page introuvable</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          La page que vous recherchez semble avoir disparu dans le cyberespace...
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound