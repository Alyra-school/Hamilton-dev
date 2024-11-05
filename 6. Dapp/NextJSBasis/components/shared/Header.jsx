'use client'
import { useState } from "react"
import Link from "next/link"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 flex items-start gap-6">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 w-6 h-6 flex flex-col justify-center gap-1.5 group"
      >
        <span className={`h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'w-6 -rotate-45 translate-y-2' : 'w-6 group-hover:w-4'}`}></span>
        <span className={`h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-4'}`}></span>
        <span className={`h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'w-6 rotate-45 -translate-y-2' : 'w-6 group-hover:w-4'}`}></span>
      </button>

      {/* Navigation Menu */}
      <nav className={`overflow-hidden transition-all duration-500 ${isOpen ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
        <div className="flex flex-col space-y-6 text-2xl font-light whitespace-nowrap">
          <Link 
            href="/story" 
            className="text-foreground hover:text-gray-400 transition-colors duration-300"
          >
            story
          </Link>
          <Link 
            href="/chronicles" 
            className="text-foreground hover:text-gray-400 transition-colors duration-300"
          >
            chronicles
          </Link>
          <Link 
            href="/tour" 
            className="text-foreground hover:text-gray-400 transition-colors duration-300"
          >
            tour
          </Link>
          <Link 
            href="/contact" 
            className="text-foreground hover:text-gray-400 transition-colors duration-300"
          >
            contact
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default Header