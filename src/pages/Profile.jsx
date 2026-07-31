import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Package, MapPin, Heart, LogOut, ChevronRight } from 'lucide-react'
import { userAPI, ordersAPI, addressAPI } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(tabParam === 'orders' ? 'orders' : 'profile')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const customerId = user?.id || user?.customerId

  useEffect(() => {
    if (!customerId) { navigate('/login'); return }
    loadData()
  }, [])

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam)
  }, [tabParam])

  const loadData = async () => {
    try {
      const [profileRes, ordersRes, addressRes] = await Promise.all([
        userAPI.profile(customerId).catch(() => ({ data: null })),
        ordersAPI.list(customerId).catch(() => ({ data: [] })),
        addressAPI.list(customerId).catch(() => ({ data: [] })),
      ])
      if (profileRes.data) setProfile(profileRes.data)
      const backendOrders = ordersRes.data || []
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]')
      setOrders([...localOrders.filter((lo) => !backendOrders.find((bo) => bo.order_id === lo.order_id)), ...backendOrders])
      if (addressRes.data) setAddresses(Array.isArray(addressRes.data) ? addressRes.data : [])
    } catch {}
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ]

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin" />
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f0eeff] via-[#f8f7ff] to-[#e8f4f8] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#6c5ce7]/25">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.name || user?.name || 'User'}</h1>
              <p className="text-gray-500 text-sm">{profile?.email || user?.email}</p>
              <p className="text-gray-400 text-xs mt-1">{profile?.mobile || user?.mobile}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/25'
                    : 'text-gray-600 hover:bg-white hover:shadow-md'
                }`}>
                <div className="flex items-center gap-3">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Name', value: profile?.name || user?.name || 'N/A', icon: User },
                    { label: 'Email', value: profile?.email || user?.email || 'N/A', icon: User },
                    { label: 'Phone', value: profile?.mobile || user?.mobile || 'N/A', icon: User },
                  ].map((field) => (
                    <div key={field.label} className="p-4 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Link to="/categories" className="bg-[#6c5ce7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-all inline-block">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.order_id || order.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                        {order.firstImage && (
                          <img src={order.firstImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{(order.order_id || order.id)?.slice(0, 12)}</p>
                          {order.productNames && (
                            <p className="text-sm text-gray-500 mt-0.5 truncate">{order.productNames}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {order.created_at || order.createdAt || 'N/A'}
                            {order.itemCount ? ` · ${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}` : ''}
                            {order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="font-bold text-[#6c5ce7]">{(order.totalAmount ?? order.total_amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            (order.paymentStatus || order.payment_status || '') === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                            order.status === 'placed' ? 'bg-blue-50 text-blue-600' :
                            'bg-yellow-50 text-yellow-600'
                          }`}>
                            {order.paymentStatus || order.payment_status || order.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Saved Addresses</h2>
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No saved addresses yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id || addr.address_id} className={`p-5 rounded-xl border ${addr.isDefault || addr.is_default ? 'border-[#6c5ce7] bg-[#6c5ce7]/5' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">{addr.type}</span>
                          {(addr.isDefault || addr.is_default) && <span className="text-xs font-semibold text-[#6c5ce7] bg-[#6c5ce7]/10 px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-sm text-gray-900">{addr.addressLine || addr.address_line}</p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
