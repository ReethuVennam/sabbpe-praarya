const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

function getToken() {
  return localStorage.getItem('token')
}

async function request(endpoint, data = {}) {
  const token = getToken()
  const body = {
    ...(token ? { token } : {}),
    data,
  }

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = token

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`)
  }

  if (!res.ok) {
    const msg = json.message || json.details?.join(', ') || json.error || `Request failed (${res.status})`
    if (res.status === 401 && !endpoint.includes('/auth/')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw new Error(msg)
  }

  return json
}

// Auth
export const authAPI = {
  register: (data) => request('/auth/register', data),
  login: (data) => request('/auth/login', data),
  forgotPassword: (email) => request('/auth/forgot-password', { email }),
  resetPassword: (data) => request('/auth/reset-password', data),
}

// Products
export const productsAPI = {
  list: (data = {}) => request('/products/list', data),
  detail: (id) => request('/products/detail', { productId: id }),
  search: (keyword) => request('/products/search', { keyword }),
}

// Cart
export const cartAPI = {
  get: (customerId) => request('/cart/get', { customerId }),
  add: (data) => request('/cart/add', data),
  update: (data) => request('/cart/update', data),
  remove: (data) => request('/cart/remove', data),
}

// Get cart item count (helper)
export async function getCartCount(customerId) {
  try {
    const data = await cartAPI.get(customerId)
    const items = data.data || []
    return Array.isArray(items) ? items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0) : 0
  } catch {
    return 0
  }
}

// Orders
export const ordersAPI = {
  create: (data) => request('/orders/create', data),
  instantBuy: (data) => request('/orders/instant-buy', data),
  list: (customerId) => request('/orders/list', { customerId }),
  detail: (orderId) => request('/orders/detail', { orderId }),
}

// User
export const userAPI = {
  profile: (customerId) => request('/user/profile', { customerId }),
  update: (data) => request('/user/update', data),
}

// Address
export const addressAPI = {
  add: (data) => request('/address/add', data),
  list: (customerId) => request('/address/list', { customerId }),
}

// Coupons
export const couponsAPI = {
  validate: (data) => request('/coupons/validate', data),
}

// Wishlist
export const wishlistAPI = {
  list: (customerId) => request('/wishlist/list', { customerId }),
  toggle: (data) => request('/wishlist/toggle', data),
}

// Payments
export const paymentsAPI = {
  updateStatus: (data) => request('/payments/update-status', data),
}

// Delivery
export const deliveryAPI = {
  create: (data) => request('/delivery/create', data),
  detail: (data) => request('/delivery/detail', data),
  updateStatus: (data) => request('/delivery/update-status', data),
}

// Returns
export const returnsAPI = {
  create: (data) => request('/returns/create', data),
  detail: (data) => request('/returns/detail', data),
  list: (customerId) => request('/returns/list', { customerId }),
}

// Refunds
export const refundsAPI = {
  create: (data) => request('/refunds/create', data),
  detail: (data) => request('/refunds/detail', data),
  list: (customerId) => request('/refunds/list', { customerId }),
}

// Invoices
export const invoicesAPI = {
  generate: (data) => request('/invoices/generate', data),
  detail: (data) => request('/invoices/detail', data),
  byOrder: (orderId) => request('/invoices/by-order', { orderId }),
  email: (data) => request('/invoices/email', data),
}

// Notifications
export const notificationsAPI = {
  send: (data) => request('/notifications/email/send', data),
  history: (customerId) => request('/notifications/email/history', { customerId }),
}

// ============================================
// SabbPe Payment Gateway
// ============================================
const SABBPE_BASE = import.meta.env.VITE_SABBPE_BASE_URL || 'https://pymntsuat.sabbpe.com'
const SABBPE_CREDENTIALS = {
  sabbpe_userid: import.meta.env.VITE_SABBPE_USERID,
  sabbpe_merchantid: import.meta.env.VITE_SABBPE_MERCHANTID,
  sabbpe_password: import.meta.env.VITE_SABBPE_PASSWORD,
}

function formatTimestamp() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

async function sabbpeRequest(endpoint, body) {
  const res = await fetch(`${SABBPE_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok || json.status === false) {
    throw new Error(json.message || `Payment failed (${res.status})`)
  }
  return json
}

export const sabbpeAPI = {
  getToken: (merchantOrderRef) =>
    sabbpeRequest('/sabbpe/v1/token', {
      ...SABBPE_CREDENTIALS,
      timestamp: formatTimestamp(),
      merchant_order_ref: merchantOrderRef,
    }),

  initiate: (sabbpeToken, amount, frontendUrl, orderRef, customer) =>
    sabbpeRequest('/sabbpe/v1/initiate', {
      sabbpe_token: sabbpeToken,
      amount,
      productinfo: 'Praarya Order',
      frontend_url: frontendUrl,
      encrypted_order_ref: orderRef,
      customer,
    }),

  getStatus: (transactionId) =>
    sabbpeRequest('/sabbpe/v1/status', { transaction_id: transactionId }),
}
