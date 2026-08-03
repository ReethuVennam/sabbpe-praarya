import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { cartAPI, productsAPI } from '../api'
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

export default function Cart() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId || null

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    setLoading(true)
    try {
      const data = await cartAPI.get(customerId || 'guest')
      const cartItems = data.data || []
      const items = Array.isArray(cartItems) ? cartItems : []

      const productIds = [...new Set(items.map((i) => i.productId || i.product_id).filter(Boolean))]
      const imageMap = {}
      if (productIds.length > 0) {
        try {
          const prodData = await productsAPI.list()
          const products = prodData.data || []
          products.forEach((p) => {
            if (productIds.includes(p.productId || p.product_id)) {
              imageMap[p.productId || p.product_id] = p.imageUrl || p.image_url
            }
          })
        } catch {}
      }

      setItems(items.map((item) => ({
        ...item,
        imageUrl: item.imageUrl || imageMap[item.productId || item.product_id] || null,
      })))
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  const updateQty = async (item, newQty) => {
    if (newQty < 1) return removeItem(item)
    setUpdating(item.cartItemId || item.id)
    try {
      await cartAPI.update({
        customerId: customerId || 'guest',
        cartItemId: item.cartItemId || item.id,
        quantity: newQty,
      })
      setItems(items.map((i) =>
        (i.cartItemId || i.id) === (item.cartItemId || item.id)
          ? { ...i, qty: newQty, quantity: newQty }
          : i
      ))
    } catch {}
    setUpdating(null)
  }

  const removeItem = async (item) => {
    setUpdating(item.cartItemId || item.id)
    try {
      await cartAPI.remove({
        customerId: customerId || 'guest',
        cartItemId: item.cartItemId || item.id,
      })
      setItems(items.filter((i) => (i.cartItemId || i.id) !== (item.cartItemId || item.id)))
    } catch {}
    setUpdating(null)
  }

  const getQty = (item) => item.qty || item.quantity || 1
  const getPrice = (item) => item.price || item.unitPrice || item.lineTotal / getQty(item) || 0
  const getName = (item) => item.productName || item.name || 'Product'
  const getTotal = (item) => getPrice(item) * getQty(item)
  const total = items.reduce((sum, i) => sum + getTotal(i), 0)

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading cart...</p>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff]">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items to get started</p>
          <Link to="/categories" className="bg-[#6c5ce7] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-colors inline-flex items-center gap-2">
            Browse categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-8 md:mb-10">
          <SectionBadge>Cart</SectionBadge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-500 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const id = item.cartItemId || item.id
              const isUpdating = updating === id
              return (
                <div key={id} className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4 sm:gap-5 hover:shadow-lg transition-all ${isUpdating ? 'opacity-50' : ''}`}>
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={getName(item)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={fallbackImgs[idx % fallbackImgs.length]} alt={getName(item)} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{getName(item)}</h3>
                        {item.selectedSize && <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>}
                        {item.selectedColor && <p className="text-xs text-gray-400">Color: {item.selectedColor}</p>}
                      </div>
                      <span className="text-[#6c5ce7] font-bold whitespace-nowrap">{getTotal(item).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-400">{getPrice(item).toFixed(2)} each</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item, getQty(item) - 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{getQty(item)}</span>
                        <button
                          onClick={() => updateQty(item, getQty(item) + 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item)}
                        disabled={isUpdating}
                        className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 h-fit sticky top-24">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-semibold">{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="font-semibold text-emerald-500">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-[#6c5ce7] text-lg">{total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="w-full bg-[#6c5ce7] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-colors flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/categories" className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
