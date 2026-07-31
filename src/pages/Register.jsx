import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => { window.location.href = '/login' }, 1500)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0eeff] via-[#f8f7ff] to-[#e8f4f8] py-16 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-gray-900">Praarya</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500">Join us and start ordering</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl px-4 py-3 mb-5">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/10 transition-all" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/10 transition-all" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1.5">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/10 transition-all" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/10 transition-all" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1.5">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/10 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#6c5ce7] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#5a4bd6] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#6c5ce7]/25 hover:shadow-xl hover:shadow-[#6c5ce7]/30">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#6c5ce7] hover:underline">Login</Link>
        </p>
      </div>
    </section>
  )
}
