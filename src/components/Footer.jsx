import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img src={logo} alt="Praarya" className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold text-white tracking-tight">Praarya</span>
                <span className="text-[10px] text-gray-400 font-medium -mt-0.5 tracking-widest uppercase">Hospitality & Entertainment</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Premium drinks, delicious snacks and unforgettable flavors — crafted fresh and delivered with care.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#6c5ce7] hover:text-white transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5">Quick Links</h4>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
              {[
                { name: 'Home', path: '/' },
                { name: 'Categories', path: '/categories' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
                { name: 'Login', path: '/login' },
                { name: 'Profile', path: '/profile' },
              ].map((link) => (
                <Link key={link.name} to={link.path} className="hover:text-white transition-colors">{link.name}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-5">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>S-5 BLDG H, ESSAR RESIDENCY</p>
              <p>Caranzalem, North Goa, 403002</p>
              <p>+91 7991562324</p>
              <p>support@praarya.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; 2026 Praarya Hospitality & Entertainment LLP. All rights reserved.</p>
          <p className="text-xs text-gray-500">Crafted with care for every moment.</p>
        </div>
      </div>
    </footer>
  )
}
