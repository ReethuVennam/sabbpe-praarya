import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { productsAPI, cartAPI } from '../api'
import catSoftDrinks from '../assets/cat-soft-drinks.jpg'
import catJuices from '../assets/cat-juices.jpg'
import catCoffeeTea from '../assets/cat-coffee-tea.jpg'
import catEnergy from '../assets/cat-energy.jpg'
import catSnacks from '../assets/cat-snacks.jpg'
import catDesserts from '../assets/cat-desserts.jpg'

const fallbackImgs = [catSoftDrinks, catJuices, catCoffeeTea, catEnergy, catSnacks, catDesserts]

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId || 'guest'

  useEffect(() => {
    fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await productsAPI.list()
      const products = data.data || []
      const found = products.find((p) => {
        const pSlug = p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        return pSlug === slug || p.productId === slug
      })
      if (found) {
        setProduct(found)
      } else {
        setError('Product not found')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const addToCart = async () => {
    setAdding(true)
    try {
      await cartAPI.add({
        customerId,
        productId: product.productId,
        quantity: qty,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff]">
        <div className="text-gray-400">Loading product...</div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Product not found'}</p>
          <Link to="/" className="text-[#6c5ce7] font-semibold hover:underline">Back to home</Link>
        </div>
      </section>
    )
  }

  const img = product.imageUrl || fallbackImgs[0]

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#6c5ce7] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-14">
          <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
            <img src={img} alt={product.name} className="w-full h-[300px] md:h-[420px] object-cover" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
            <p className="text-2xl font-bold text-[#6c5ce7] mb-4">{product.price?.toFixed(2)}</p>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6 max-w-xl">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
                <div className="flex gap-2">
                  {product.sizes.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#6c5ce7] hover:text-[#6c5ce7] cursor-pointer transition-colors">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors font-bold">-</button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors font-bold">+</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={addToCart}
                disabled={adding}
                className="bg-[#6c5ce7] text-white px-7 py-3 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-[#5a4bd6] transition-colors disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                {added ? 'Added!' : adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <Link to="/" className="border border-gray-300 text-gray-700 px-7 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                Keep browsing
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {fallbackImgs.slice(0, 3).map((imgSrc, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-44 overflow-hidden">
                  <img src={imgSrc} alt={`Related ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-400">View in category</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
