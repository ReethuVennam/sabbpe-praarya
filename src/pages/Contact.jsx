import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function SectionBadge({ children }) {
  return (
    <span className="inline-block px-4 py-1.5 rounded-full border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-semibold tracking-wider uppercase mb-4">
      {children}
    </span>
  )
}

const contactCards = [
  { icon: MapPin, label: 'ADDRESS', value: 'S-5 BLDG H, ESSAR RESIDENCY, Caranzalem, Tiswadi, North Goa, Goa, 403002' },
  { icon: Phone, label: 'PHONE', value: '+91 7991562324' },
  { icon: Mail, label: 'EMAIL', value: 'support@praarya.com' },
  { icon: Clock, label: 'WORKING HOURS', value: 'Mon-Sun - 8:00 AM - 11:00 PM' },
]

const position = [15.4986, 73.8104]

export default function Contact() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#f8f7ff]">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-9 md:mb-10">
          <SectionBadge>Contact</SectionBadge>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Let's talk flavor</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Questions, catering requests or feedback — we reply within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {contactCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#6c5ce7]/10 flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5 text-[#6c5ce7]" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-1">{card.label}</p>
              <p className="text-sm text-gray-900 font-medium leading-snug">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <MapContainer
            center={position}
            zoom={14}
            scrollWheelZoom={false}
            className="w-full h-[320px] rounded-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <strong>Praarya</strong><br />Caranzalem, Goa, 403002
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </section>
  )
}
