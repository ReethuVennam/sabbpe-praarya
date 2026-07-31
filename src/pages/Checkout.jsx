import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ShieldCheck, Loader2, ArrowLeft, MapPin } from 'lucide-react'
import { cartAPI, ordersAPI, addressAPI, sabbpeAPI } from '../api'

function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold tracking-wider uppercase mb-4">
      {children}
    </span>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [addressId, setAddressId] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ line: '', city: '', state: '', pincode: '' })
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId

  useEffect(() => {
    if (!customerId) { navigate('/login'); return }
    loadCart()
    loadAddress()
  }, [])

  const loadCart = async () => {
    try {
      const data = await cartAPI.get(customerId)
      const cartItems = data.data || []
      setItems(Array.isArray(cartItems) ? cartItems : [])
    } catch {}
    setLoading(false)
  }

  const loadAddress = async () => {
    try {
      const res = await addressAPI.list(customerId)
      const addresses = res.data || []
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
      if (defaultAddr) {
        setAddressId(defaultAddr.id || defaultAddr.addressId)
      } else {
        setShowAddressForm(true)
      }
    } catch {
      setShowAddressForm(true)
    }
  }

  const getQty = (item) => item.qty || item.quantity || 1
  const getPrice = (item) => item.price || item.unitPrice || item.lineTotal / getQty(item) || 0
  const getName = (item) => item.productName || item.name || 'Product'
  const getTotal = (item) => getPrice(item) * getQty(item)
  const total = items.reduce((sum, i) => sum + getTotal(i), 0)

  const handlePay = async () => {
    setError('')
    setPaying(true)

    if (!addressId) {
      setError('Please enter your delivery address')
      setPaying(false)
      return
    }

    try {
      const orderItems = items
        .filter((item) => item.variantId || item.variant_id)
        .map((item) => ({
          variantId: item.variantId || item.variant_id,
          quantity: getQty(item),
          price: getPrice(item),
        }))

      const orderRef = `PRAARYA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const frontendUrl = window.location.origin

      let orderId = ''
      if (orderItems.length > 0) {
        try {
          const data = await ordersAPI.create({
            customerId,
            addressId,
            paymentMethod: 'SABBPE',
            gatewayRef: orderRef,
            items: orderItems,
          })
          orderId = data.data?.orderId || data.data?.order_id || ''
        } catch (e) {
          console.warn('Order create:', e.message)
        }
      }

      if (orderId) localStorage.setItem('pending_order_id', orderId)

      await Promise.all(items.map((item) =>
        cartAPI.remove({ customerId, cartItemId: item.cartItemId || item.id }).catch(() => {})
      ))

      const tokenRes = await sabbpeAPI.getToken(orderRef)
      const initRes = await sabbpeAPI.initiate(
        tokenRes.sabbpe_token, total, frontendUrl, orderRef,
        { firstname: 'Praarya', email: import.meta.env.VITE_MERCHANT_EMAIL, phone: import.meta.env.VITE_MERCHANT_PHONE }
      )

      if (initRes.payment_url) {
        window.location.href = initRes.payment_url
      } else {
        navigate('/payment-result')
      }
    } catch (err) {
      setError(err.message || 'Payment initiation failed')
    }
    setPaying(false)
  }

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff]">
        <Loader2 className="w-6 h-6 text-[#6c5ce7] animate-spin" />
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff]">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items before checking out</p>
          <Link to="/categories" className="bg-[#6c5ce7] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-colors">
            Browse categories
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#6c5ce7] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </Link>

        <div className="text-center mb-10">
          <SectionBadge>Checkout</SectionBadge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Complete your order</h1>
          <p className="text-gray-500 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} · Secure payment via SabbPe</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
        )}

        {showAddressForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#6c5ce7]" /> Delivery Address</h3>
            <div className="space-y-4">
              <input
                type="text" placeholder="Address line" value={newAddress.line}
                onChange={(e) => setNewAddress({ ...newAddress, line: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7]"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text" placeholder="City" value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7]"
                />
                <input
                  type="text" placeholder="State" value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7]"
                />
                <input
                  type="text" placeholder="Pincode" value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <button
                onClick={async () => {
                  if (!newAddress.line || !newAddress.city) return
                  try {
                    const res = await addressAPI.add({
                      customerId, type: 'HOME', addressLine: newAddress.line,
                      city: newAddress.city, state: newAddress.state || 'Maharashtra',
                      pincode: newAddress.pincode || '400001', isDefault: true,
                    })
                    const addrId = res.data?.id || res.data?.addressId
                    if (addrId) { setAddressId(addrId); setShowAddressForm(false) }
                  } catch (e) { setAddressId('user-' + Date.now()); setShowAddressForm(false) }
                }}
                className="bg-[#6c5ce7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.cartItemId || item.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{getName(item)} <span className="text-gray-400">× {getQty(item)}</span></span>
                <span className="font-semibold text-gray-900">{getTotal(item).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{total.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="font-semibold text-emerald-500">Free</span></div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-bold text-[#6c5ce7] text-xl">{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-gray-50">
            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">You'll be redirected to SabbPe's secure payment gateway.</p>
          </div>
          <button onClick={handlePay} disabled={paying}
            className="w-full bg-[#6c5ce7] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment...</> : <>Pay {total.toFixed(2)} securely</>}
          </button>
        </div>
      </div>
    </section>
  )
}
