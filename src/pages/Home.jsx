import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Star, Truck, Leaf, ArrowRight, ShieldCheck, Sparkles, ShoppingBag, Check } from 'lucide-react'
import { productsAPI, cartAPI } from '../api'
import heroWoman from '../assets/hero-woman-drink.jpg'
import catSoftDrinks from '../assets/cat-soft-drinks.jpg'
import catJuices from '../assets/cat-juices.jpg'
import catCoffeeTea from '../assets/cat-coffee-tea.jpg'
import catEnergy from '../assets/cat-energy.jpg'
import catSnacks from '../assets/cat-snacks.jpg'
import catDesserts from '../assets/cat-desserts.jpg'

const fallbackImgs = { 'soft-drinks': catSoftDrinks, 'fresh-juices': catJuices, 'coffee-tea': catCoffeeTea, 'energy-drinks': catEnergy, snacks: catSnacks, desserts: catDesserts }
const allFallback = [catSoftDrinks, catJuices, catCoffeeTea, catEnergy, catSnacks, catDesserts]

const specialOffers = [
  { badge: 'Save 25%', badgeColor: 'bg-emerald-500', title: 'Weekend Combo', desc: 'Any two drinks plus a snack for a flat weekend price.' },
  { badge: 'Best value', badgeColor: 'bg-[#6c5ce7]', title: 'Morning Brew Pass', desc: 'Ten coffees, one pass. Redeem any morning before 11am.' },
  { badge: 'New', badgeColor: 'bg-[#6c5ce7]', title: 'Dessert Duo', desc: 'Two patisserie desserts with a complimentary tea.' },
]

const reviews = [
  { quote: '"The cold-pressed juices are unreal, and delivery is always on time. It\'s my daily morning ritual now."', name: 'Aarav Mehta', role: 'Regular customer', initial: 'A' },
  { quote: '"We serve their coffee blend in our shop. Consistent quality, beautiful packaging, easy ordering."', name: 'Sofia Lindqvist', role: 'Cafe owner', initial: 'S' },
  { quote: '"Our team orders snacks and drinks weekly. The variety keeps everyone happy and pricing is fair."', name: 'Daniel Okafor', role: 'Office manager', initial: 'D' },
]

const stats = [
  { value: '120K+', numeric: 120, suffix: 'K+', label: 'Drinks served' },
  { value: '68+', numeric: 68, suffix: '+', label: 'Signature flavors' },
  { value: '24/7', numeric: 24, suffix: '/7', label: 'Delivery support' },
  { value: '4.9\u2605', numeric: 4.9, suffix: '\u2605', label: 'Average rating' },
]

function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold tracking-wider uppercase mb-4">
      {children}
    </span>
  )
}

function getSlug(name) {
  return name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ''
}

function getImg(product, idx) {
  if (product.imageUrl) return product.imageUrl
  const slug = getSlug(product.name)
  if (fallbackImgs[slug]) return fallbackImgs[slug]
  return allFallback[idx % allFallback.length]
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f0eeff] via-[#f5f3ff] to-[#e8f4f8]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white/70 backdrop-blur text-sm text-gray-600 mb-6">
              <Sparkles className="w-4 h-4 text-[#6c5ce7]" />
              Fresh every single day
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 mb-4">
              Refresh Every<br />Moment with<br />
              <span className="text-[#6c5ce7]">Praarya</span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg max-w-md mb-8 leading-relaxed">
              Premium drinks, delicious snacks, and unforgettable flavors delivered with quality and style.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/categories" className="bg-[#6c5ce7] text-white px-7 py-3.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-[#5a4bd6] transition-colors shadow-lg shadow-[#6c5ce7]/20">
                Explore Categories <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="border border-gray-300 text-gray-700 px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                Contact Us
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-[#6c5ce7] fill-[#6c5ce7]" /> 4.9 rating</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#6c5ce7]" /> 30-min delivery</span>
              <span className="flex items-center gap-1.5"><Leaf className="w-4 h-4 text-[#6c5ce7]" /> Natural ingredients</span>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-[300px] h-[360px] sm:w-[360px] sm:h-[430px] md:w-[420px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img src={heroWoman} alt="Woman with iced drink" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 left-3 sm:-left-5 bg-gradient-to-r from-[#f0eeff] to-[#e8f4f8] rounded-2xl shadow-xl p-4">
                <p className="text-xs text-gray-500 mb-0.5">Today's favorite</p>
                <p className="text-sm font-semibold text-gray-900">Citrus Sparkle &middot; 4.50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, idx, imgOffset = 0 }) {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
      <Link to={`/product/${getSlug(product.name)}`}>
        <div className="h-48 sm:h-52 overflow-hidden">
          <img src={getImg(product, idx + imgOffset)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${getSlug(product.name)}`} className="flex-1">
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
            to={`/product/${getSlug(product.name)}`}
            className="group/btn inline-flex items-center gap-1 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full px-3 py-2 transition-all duration-300 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7]"
          >
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeaturedDrinks({ products }) {
  return (
    <section className="py-14 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Featured</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Featured Drinks</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Hand-picked pours our regulars come back for, week after week.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {products.map((p, idx) => (
            <ProductCard key={p.productId || idx} product={p} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PopularSnacks({ products }) {
  return (
    <section className="py-14 md:py-16 bg-gradient-to-b from-[#f8f7ff] to-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Popular</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Popular Snacks</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Crisp, sweet and savory companions made to pair with your drink.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {products.map((p, idx) => (
            <ProductCard key={p.productId || idx} product={p} idx={idx} imgOffset={3} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SpecialOffers() {
  return (
    <section className="py-14 md:py-16 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Offers</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Special Offers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {specialOffers.map((offer) => (
            <div key={offer.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow h-full">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-5 ${offer.badgeColor}`}>{offer.badge}</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{offer.title}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{offer.desc}</p>
              <span className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full px-4 py-2 transition-all duration-300 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7]">
                View Details
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomerReviews() {
  return (
    <section className="py-14 md:py-16 bg-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Reviews</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Customer Reviews</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {reviews.map((review) => (
            <div key={review.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#6c5ce7] fill-[#6c5ce7]" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">{review.quote}</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-[#6c5ce7] flex items-center justify-center text-white font-bold text-sm">{review.initial}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                  <p className="text-xs text-gray-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  const isDecimal = end % 1 !== 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = 0
          const increment = end / (duration / 16)
          let current = start
          const timer = setInterval(() => {
            current += increment
            if (current >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current))
            }
          }, 16)
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, isDecimal])

  return <span ref={ref}>{isDecimal ? count.toFixed(1) : count}{suffix}</span>
}

function Stats() {
  return (
    <section className="py-12 md:py-14 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#6c5ce7] mb-1">
                {stat.numeric > 0 ? <Counter end={stat.numeric} suffix={stat.suffix} /> : stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BrowseCategories({ products }) {
  const catMap = {}
  products.forEach((p) => {
    const name = p.category || p.brand || 'Other'
    if (!catMap[name]) catMap[name] = { name, count: 0, desc: p.description, img: p.imageUrl || null }
    catMap[name].count++
    if (!catMap[name].img && p.imageUrl) catMap[name].img = p.imageUrl
  })

  const cats = Object.values(catMap).slice(0, 6)

  return (
    <section id="browse-categories" className="py-14 md:py-16 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Browse</SectionBadge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Find your flavor</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Six curated categories, from cold-pressed juices to patisserie desserts.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-9">
          {cats.map((cat, idx) => (
            <Link key={cat.name} to={`/categories/${getSlug(cat.name)}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
              <div className="h-44 overflow-hidden">
                <img src={cat.img || allFallback[idx % allFallback.length]} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                  <span className="text-xs text-gray-400 font-medium">{cat.count} items</span>
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{cat.desc}</p>
                <span className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-full px-4 py-2 transition-all duration-300 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7] w-fit">
                  Explore
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/categories" className="bg-[#6c5ce7] text-white px-8 py-3.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#5a4bd6] transition-colors shadow-lg shadow-[#6c5ce7]/20">
            See all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-14 md:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="bg-gradient-to-r from-[#e8e4ff] via-[#f0eeff] to-[#e4f0f8] rounded-3xl py-12 md:py-14 px-6 md:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-7 h-7 text-[#6c5ce7]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ready to taste the difference?</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Create an account and get your first delivery on us.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-[#6c5ce7] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-colors shadow-lg shadow-[#6c5ce7]/20">Get started</Link>
            <Link to="/about" className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/80 transition-colors">Our story</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
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
      setProducts([])
    }
    setLoading(false)
  }

  const featured = products.slice(0, 3)
  const snacks = products.slice(3, 6)

  return (
    <>
      <Hero />
      {loading ? (
        <section className="py-14 md:py-16 bg-white">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#6c5ce7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400">Loading products from database...</p>
          </div>
        </section>
      ) : error ? (
        <section className="py-14 md:py-16 bg-white">
          <div className="text-center max-w-md mx-auto px-6">
            <p className="text-red-500 mb-2 font-semibold">Failed to load products</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <p className="text-gray-400 text-xs">Make sure the backend is running and the database tables/procedures exist.</p>
          </div>
        </section>
      ) : (
        <>
          <FeaturedDrinks products={featured.length > 0 ? featured : [
            { name: 'Citrus Sparkle', price: 4.50, description: 'Sparkling citrus with a hint of mint' },
            { name: 'Sunrise Press', price: 5.20, description: 'Cold-pressed orange and berry blend' },
            { name: 'Velvet Latte', price: 4.80, description: 'Silky microfoam over double espresso' },
          ]} />
          <PopularSnacks products={snacks.length > 0 ? snacks : [
            { name: 'Golden Crisps', price: 3.20, description: 'Kettle-cooked, sea salt finish' },
            { name: 'Berry Tart', price: 5.60, description: 'Buttery shell, fresh seasonal berries' },
            { name: 'Mint Lift Can', price: 3.90, description: 'Natural caffeine, light sparkle' },
          ]} />
          <BrowseCategories products={products} />
        </>
      )}
      <SpecialOffers />
      <CustomerReviews />
      <Stats />
      <CTA />
    </>
  )
}
