import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, Package, Loader2 } from 'lucide-react'
import { notificationAPI } from '../api'

export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const status = searchParams.get('status')
  const txnid = searchParams.get('txnid')
  const errorCode = searchParams.get('error')
  const [processing, setProcessing] = useState(false)
  const sentRef = useRef(false)

  useEffect(() => {
    if (status === 'SUCCESS' && !sentRef.current) {
      sentRef.current = true
      setProcessing(true)
      const pendingOrderId = localStorage.getItem('pending_order_id')
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const customerId = user?.id || user?.customerId

      if (pendingOrderId && customerId) {
        const items = JSON.parse(localStorage.getItem('last_order_items') || '[]')
        const total = localStorage.getItem('last_order_total') || '0'

        notificationAPI.sendInvoice({
          templateName: 'praarya_invoice',
          clientName: user?.name || 'Customer',
          clientEmail: user?.email || 'support@praarya.com',
          orderNumber: pendingOrderId,
          orderStatus: 'PAID',
          totalAmount: parseFloat(total),
          netAmountPaid: parseFloat(total),
          currency: 'INR',
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          items: items.length > 0 ? items : null,
        }).catch(() => {})

        localStorage.removeItem('pending_order_id')
        localStorage.removeItem('last_order_items')
        localStorage.removeItem('last_order_total')
        setProcessing(false)
      }

      const timer = setTimeout(() => navigate('/profile?tab=orders', { replace: true }), 4000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate, txnid])

  if (!status) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff] py-16 px-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
          <Package className="w-20 h-20 mx-auto text-[#6c5ce7] mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment submitted</h1>
          <p className="text-gray-500 mb-6">Your order has been placed. View your orders below.</p>
          <div className="flex flex-col gap-3">
            <Link to="/profile?tab=orders" className="w-full bg-[#6c5ce7] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-colors flex items-center justify-center gap-2">
              View Orders <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const config = {
    SUCCESS: {
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      title: 'Payment Successful!',
      message: processing ? 'Updating your order...' : 'Your order has been placed. Redirecting to orders...',
    },
    PENDING: {
      icon: Clock,
      iconColor: 'text-yellow-500',
      title: 'Payment Processing',
      message: 'Your payment is being processed.',
    },
    FAILED: {
      icon: XCircle,
      iconColor: 'text-red-500',
      title: 'Payment Failed',
      message: 'Your payment was declined.',
    },
    CANCELLED: {
      icon: XCircle,
      iconColor: 'text-gray-400',
      title: 'Payment Cancelled',
      message: 'You cancelled the payment.',
    },
    ERROR: {
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      title: 'Payment Error',
      message: `An error occurred: ${errorCode || 'Unknown'}`,
    },
  }

  const result = config[status] || config.ERROR
  const Icon = result.icon

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white to-[#f8f7ff] py-16 px-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
        <div className="mb-6">
          {processing ? (
            <Loader2 className="w-20 h-20 mx-auto text-[#6c5ce7] animate-spin" />
          ) : (
            <Icon className={`w-20 h-20 mx-auto ${result.iconColor}`} />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{result.title}</h1>
        <p className="text-gray-500 mb-6">{result.message}</p>

        {txnid && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-400 mb-1">Transaction Reference</p>
            <p className="text-sm font-mono text-gray-700 break-all">{txnid}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {status === 'SUCCESS' || status === 'PENDING' ? (
            <>
              <Link to="/profile?tab=orders" className="w-full bg-[#6c5ce7] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-colors flex items-center justify-center gap-2">
                View Orders <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Continue Shopping
              </Link>
            </>
          ) : (
            <>
              <Link to="/checkout" className="w-full bg-[#6c5ce7] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-colors flex items-center justify-center gap-2">
                Try Again <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/cart" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Back to Cart
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
