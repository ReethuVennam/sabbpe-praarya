import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Check } from 'lucide-react'
import { productsAPI, cartAPI } from '../api'
import catSoftDrinks from '../assets/cat-soft-drinks.jpg'
import catJuices from '../assets/cat-juices.jpg'
import catCoffeeTea from '../assets/cat-coffee-tea.jpg'
import catEnergy from '../assets/cat-energy.jpg'
import catSnacks from '../assets/cat-snacks.jpg'
import catDesserts from '../assets/cat-desserts.jpg'

const fallbackImages = [catSoftDrinks, catJuices, catCoffeeTea, catEnergy, catSnacks, catDesserts]

function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold tracking-wider uppercase mb-4">
      {children}
    </span>
  )
}

function ProductCard({ product, idx }) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId || 'guest'

  const addToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    try {
      await cartAPI.add({
        customerId,
        productId: product.productId,
        quantity: 1,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } catch {}
    setAdding(false)
  }

  const slug = product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const img = product.imageUrl || fallbackImages[idx % fallbackImages.length]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
      <Link to={`/product/${slug}`}>
        <div className="h-48 overflow-hidden">
          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${slug}`} className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">{product.name}</h3>
            <span className="text-[#6c5ce7] font-bold whitespace-nowrap">{product.price?.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={addToCart}
            disabled={adding}
            className="flex-1 group/btn inline-flex items-center justify-center gap-2 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 transition-all duration-300 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7] disabled:opacity-50"
          >
            {added ? (
              <><Check className="w-4 h-4" /> Added!</>
            ) : (
              <><ShoppingBag className="w-4 h-4" /> {adding ? 'Adding...' : 'Add to Cart'}</>
            )}
          </button>
          <Link
            to={`/product/${slug}`}
            className="group/btn inline-flex items-center gap-1 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full px-3 py-2 transition-all duration-300 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7]"
          >
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Categories() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.list()
      setProducts(data.data || [])
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Menu</SectionBadge>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Explore our menu</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Everything we make, sorted the way you crave it.
          </p>
          {!loading && (
            <p className="text-xs text-gray-400 mt-2">
              {error ? `API error — ${error}` : `${products.length} products loaded from database`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found. Add products to your database first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {products.map((p, idx) => (
              <ProductCard key={p.productId || idx} product={p} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
