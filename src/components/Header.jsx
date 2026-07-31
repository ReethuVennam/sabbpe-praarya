import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Heart, User, Menu, X } from 'lucide-react'
import { getCartCount } from '../api'
import logo from '../assets/logo.png'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Categories', path: '/categories' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Header() {
  const location = useLocation()
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (customerId || token) loadCartCount()
  }, [customerId, token, location.pathname])

  const loadCartCount = async () => {
    const count = await getCartCount(customerId || 'guest')
    setCartCount(count)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Praarya" className="w-12 h-12 rounded-xl object-cover transition-transform group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-gray-900 tracking-tight">Praarya</span>
            <span className="text-[10px] text-gray-400 font-medium -mt-0.5 tracking-widest uppercase">Hospitality & Entertainment</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-md rounded-full px-2 py-1 border border-gray-100">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                location.pathname === link.path
                  ? 'bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {token && (
            <>
              <Link to="/wishlist" className="relative w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#6c5ce7] hover:border-[#6c5ce7]/30 hover:shadow-md hover:shadow-[#6c5ce7]/10 transition-all duration-300">
                <Heart className="w-[18px] h-[18px]" />
              </Link>
              <Link to="/cart" className="relative w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#6c5ce7] hover:border-[#6c5ce7]/30 hover:shadow-md hover:shadow-[#6c5ce7]/10 transition-all duration-300">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6c5ce7] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#6c5ce7]/25 hover:shadow-lg hover:shadow-[#6c5ce7]/30 transition-all duration-300">
                {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </Link>
            </>
          )}
          {!token && (
            <Link to="/login" className="bg-[#6c5ce7] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-all duration-300 shadow-md shadow-[#6c5ce7]/25 hover:shadow-lg hover:shadow-[#6c5ce7]/30">
              Login
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === link.path ? 'bg-[#6c5ce7] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
