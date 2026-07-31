import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { wishlistAPI, cartAPI } from '../api'
import catSoftDrinks from '../assets/cat-soft-drinks.jpg'
import catJuices from '../assets/cat-juices.jpg'
import catCoffeeTea from '../assets/cat-coffee-tea.jpg'
import catEnergy from '../assets/cat-energy.jpg'
import catSnacks from '../assets/cat-snacks.jpg'
import catDesserts from '../assets/cat-desserts.jpg'

const fallbackImgs = [catSoftDrinks, catJuices, catCoffeeTea, catEnergy, catSnacks, catDesserts]

function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold tracking-wider uppercase mb-4">
      {children}
    </span>
  )
}

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId

  useEffect(() => { loadWishlist() }, [])

  const loadWishlist = async () => {
    try {
      const data = await wishlistAPI.list(customerId || '')
      setItems(data.data || [])
    } catch {}
    setLoading(false)
  }

  const removeItem = async (productId) => {
    try {
      await wishlistAPI.toggle({ customerId, productId })
      setItems(items.filter((i) => i.id !== productId))
    } catch {}
  }

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff]">
        <div className="text-gray-400">Loading...</div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <SectionBadge>Wishlist</SectionBadge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love for later</p>
            <Link to="/categories" className="bg-[#6c5ce7] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-colors inline-block">
              Browse categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div key={item.id || idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 overflow-hidden relative">
                  <img src={item.images?.[0] || fallbackImgs[idx % 6]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-400 hover:text-red-600 transition-all shadow">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <span className="text-[#6c5ce7] font-bold">{item.price}</span>
                  </div>
                  <Link to={`/product/${item.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="text-sm font-semibold text-[#6c5ce7] hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
