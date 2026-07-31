import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import catSoftDrinks from '../assets/cat-soft-drinks.jpg'
import catJuices from '../assets/cat-juices.jpg'
import catCoffeeTea from '../assets/cat-coffee-tea.jpg'
import catEnergy from '../assets/cat-energy.jpg'
import catSnacks from '../assets/cat-snacks.jpg'
import catDesserts from '../assets/cat-desserts.jpg'

const categoriesData = {
  'soft-drinks': {
    name: 'Soft Drinks',
    count: '24 drinks',
    desc: 'Chilled classics and sparkling refreshers served ice-cold.',
    img: catSoftDrinks,
    features: ['Chilled to perfection', 'Natural flavors', 'Delivered in 30 minutes'],
  },
  'fresh-juices': {
    name: 'Fresh Juices',
    count: '18 juices',
    desc: 'Cold-pressed daily from seasonal fruit, nothing added.',
    img: catJuices,
    features: ['Freshly prepared daily', 'Hygienic packaging', 'Delivered in 30 minutes'],
  },
  'coffee-tea': {
    name: 'Coffee & Tea',
    count: '21 brews',
    desc: 'Single-origin espresso, slow brews and delicate leaf teas.',
    img: catCoffeeTea,
    features: ['Premium single-origin beans', 'Freshly brewed to order', 'Delivered in 30 minutes'],
  },
  'energy-drinks': {
    name: 'Energy Drinks',
    count: '12 cans',
    desc: 'Clean lift with light carbonation and natural caffeine.',
    img: catEnergy,
    features: ['Natural caffeine', 'Light carbonation', 'Delivered in 30 minutes'],
  },
  snacks: {
    name: 'Snacks',
    count: '30 snacks',
    desc: 'Crisp, savory and shareable — perfect drink companions.',
    img: catSnacks,
    features: ['Kettle-cooked freshness', 'Premium ingredients', 'Delivered in 30 minutes'],
  },
  desserts: {
    name: 'Desserts',
    count: '15 treats',
    desc: 'Patisserie-style sweets baked fresh every morning.',
    img: catDesserts,
    features: ['Baked fresh daily', 'Artisan quality', 'Delivered in 30 minutes'],
  },
}

const allCategories = [
  { slug: 'soft-drinks', name: 'Soft Drinks', img: catSoftDrinks },
  { slug: 'fresh-juices', name: 'Fresh Juices', img: catJuices },
  { slug: 'coffee-tea', name: 'Coffee & Tea', img: catCoffeeTea },
  { slug: 'energy-drinks', name: 'Energy Drinks', img: catEnergy },
  { slug: 'snacks', name: 'Snacks', img: catSnacks },
  { slug: 'desserts', name: 'Desserts', img: catDesserts },
]

export default function CategoryDetail() {
  const { slug } = useParams()
  const cat = categoriesData[slug]
  const related = allCategories.filter((c) => c.slug !== slug).slice(0, 3)

  if (!cat) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Category not found</p>
          <Link to="/categories" className="text-[#6c5ce7] font-semibold hover:underline">
            Back to categories
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#6c5ce7] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          All categories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-14">
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img src={cat.img} alt={cat.name} className="w-full h-[300px] md:h-[420px] object-cover" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold mb-4">
              {cat.count}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{cat.name}</h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6 max-w-xl">{cat.desc}</p>

            <div className="space-y-3 mb-6">
              {cat.features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-[#6c5ce7] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-colors">
                Order now
              </button>
              <Link
                to="/categories"
                className="border border-gray-300 text-gray-700 px-7 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Keep browsing
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/categories/${r.slug}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="h-44 overflow-hidden">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{r.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
