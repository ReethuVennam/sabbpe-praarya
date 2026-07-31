import { ArrowRight, ShieldCheck, Truck, Heart, Star } from 'lucide-react'
import aboutPrep from '../assets/about-prep.jpg'

function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold tracking-wider uppercase mb-4">
      {children}
    </span>
  )
}

const features = [
  { icon: ShieldCheck, title: 'Premium Ingredients', desc: 'Sourced seasonally, never artificial.', color: 'bg-teal-50 text-teal-500' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Cold-pressed, at your door in 30 minutes.', color: 'bg-teal-50 text-teal-500' },
  { icon: Heart, title: 'Hygienic Preparation', desc: 'Air-sealed kitchens and sealed packaging.', color: 'bg-teal-50 text-teal-500' },
  { icon: Star, title: 'Customer Satisfaction', desc: '4.9 average rating across 12,000 orders.', color: 'bg-teal-50 text-teal-500' },
]

export default function About() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>About</SectionBadge>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Small batches, big flavor</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            We started in one kitchen with a simple belief: a great drink can make an ordinary moment memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-14">
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img src={aboutPrep} alt="Making fresh juice" className="w-full h-[300px] md:h-[420px] object-cover" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our story</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              What began as a weekend juice cart is now a full beverage kitchen serving thousands of people every month. We still press fruit the same morning it's served, still roast in small batches, and still taste every recipe before it reaches a menu.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              Every cup is built around three things: clean ingredients, careful preparation, and a delivery experience that keeps the drink exactly as it left us.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-[#6c5ce7] text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-[#5a4bd6] transition-colors">
              Learn More <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow h-full">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
