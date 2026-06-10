import { useState, useMemo } from 'react'
import { useTripNotes } from '@/hooks/useTripNotes'
import { Trash2, Plus, Check } from 'lucide-react'
import type { Trip } from '@/types'

const CATEGORIES = [
  { key: 'sight',    emoji: '🏛️', label: 'Sight' },
  { key: 'food',     emoji: '🍽️', label: 'Food' },
  { key: 'activity', emoji: '🎭', label: 'Activity' },
  { key: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { key: 'other',    emoji: '📌', label: 'Other' },
]

type WishItem = { title: string; category: string }

function getDestWishlist(destinations: string[]): WishItem[] {
  const dest = destinations.join(' ').toLowerCase()
  const out: WishItem[] = []

  if (dest.includes('london') || dest.includes('england')) out.push(
    { title: 'Tower of London', category: 'sight' },
    { title: 'Borough Market', category: 'food' },
    { title: 'Tate Modern', category: 'sight' },
    { title: 'Notting Hill', category: 'activity' },
    { title: 'West End show', category: 'activity' },
    { title: 'Buckingham Palace', category: 'sight' },
    { title: 'British Museum', category: 'sight' },
    { title: 'Afternoon tea', category: 'food' },
    { title: 'Camden Market', category: 'shopping' },
    { title: 'Hyde Park', category: 'activity' },
    { title: 'Greenwich', category: 'sight' },
  )
  if (dest.includes('paris') || dest.includes('france')) out.push(
    { title: 'Eiffel Tower', category: 'sight' },
    { title: 'Louvre Museum', category: 'sight' },
    { title: 'Montmartre walk', category: 'activity' },
    { title: 'Seine cruise', category: 'activity' },
    { title: 'Croissant tasting', category: 'food' },
    { title: "Musée d'Orsay", category: 'sight' },
    { title: 'Versailles day trip', category: 'sight' },
    { title: 'Notre-Dame', category: 'sight' },
    { title: 'Picnic in Luxembourg Gardens', category: 'activity' },
    { title: 'Rue de Rivoli shopping', category: 'shopping' },
  )
  if (dest.includes('singapore')) out.push(
    { title: 'Gardens by the Bay', category: 'sight' },
    { title: 'Marina Bay Sands', category: 'sight' },
    { title: 'Hawker centre meal', category: 'food' },
    { title: 'Sentosa Island', category: 'activity' },
    { title: 'Chinatown night market', category: 'food' },
    { title: 'Universal Studios', category: 'activity' },
    { title: 'Clarke Quay', category: 'activity' },
    { title: 'Little India', category: 'activity' },
    { title: 'Orchard Road shopping', category: 'shopping' },
  )
  if (dest.includes('bali')) out.push(
    { title: 'Tegalalang Rice Terraces', category: 'sight' },
    { title: 'Uluwatu Temple', category: 'sight' },
    { title: 'Cooking class', category: 'activity' },
    { title: 'Seminyak beach', category: 'activity' },
    { title: 'Ubud market', category: 'shopping' },
    { title: 'Mount Batur sunrise hike', category: 'activity' },
    { title: 'Sacred Monkey Forest', category: 'sight' },
    { title: 'Tanah Lot temple', category: 'sight' },
    { title: 'Traditional spa & massage', category: 'activity' },
    { title: 'Nusa Penida day trip', category: 'activity' },
  )
  if (dest.includes('tokyo') || dest.includes('japan')) out.push(
    { title: 'Shibuya Crossing', category: 'sight' },
    { title: 'Senso-ji Temple', category: 'sight' },
    { title: 'Ramen dinner', category: 'food' },
    { title: 'teamLab digital art', category: 'activity' },
    { title: 'Harajuku', category: 'activity' },
    { title: 'Shinjuku Gyoen', category: 'sight' },
    { title: 'Tsukiji outer market', category: 'food' },
    { title: 'Akihabara electronics', category: 'shopping' },
    { title: 'Mount Fuji day trip', category: 'sight' },
    { title: 'Onsen experience', category: 'activity' },
    { title: 'Izakaya dinner', category: 'food' },
    { title: 'Sumo match', category: 'activity' },
  )
  if (dest.includes('kyoto')) out.push(
    { title: 'Fushimi Inari shrine', category: 'sight' },
    { title: 'Arashiyama bamboo grove', category: 'sight' },
    { title: 'Gion district walk', category: 'activity' },
    { title: 'Kinkaku-ji Golden Pavilion', category: 'sight' },
    { title: 'Tea ceremony', category: 'activity' },
    { title: "Philosopher's Path", category: 'activity' },
    { title: 'Nishiki Market', category: 'food' },
  )
  if (dest.includes('seoul') || dest.includes('korea')) out.push(
    { title: 'Gyeongbokgung Palace', category: 'sight' },
    { title: 'Bukchon Hanok Village', category: 'sight' },
    { title: 'Korean BBQ dinner', category: 'food' },
    { title: 'Myeongdong shopping', category: 'shopping' },
    { title: 'N Seoul Tower', category: 'sight' },
    { title: 'Han River picnic', category: 'activity' },
    { title: 'K-beauty shopping', category: 'shopping' },
    { title: 'Street tteokbokki', category: 'food' },
  )
  if (dest.includes('rome') || (dest.includes('italy') && !dest.includes('milan'))) out.push(
    { title: 'Colosseum', category: 'sight' },
    { title: 'Vatican Museums', category: 'sight' },
    { title: 'Trevi Fountain', category: 'sight' },
    { title: 'Gelato tasting', category: 'food' },
    { title: 'Pantheon', category: 'sight' },
    { title: "Campo de' Fiori market", category: 'food' },
    { title: 'Trastevere neighbourhood', category: 'activity' },
    { title: 'Galleria Borghese', category: 'sight' },
  )
  if (dest.includes('barcelona') || dest.includes('spain')) out.push(
    { title: 'Sagrada Família', category: 'sight' },
    { title: 'Park Güell', category: 'sight' },
    { title: 'Tapas tasting', category: 'food' },
    { title: 'La Boqueria', category: 'food' },
    { title: 'Gothic Quarter walk', category: 'activity' },
    { title: 'Barceloneta beach', category: 'activity' },
    { title: 'El Born neighbourhood', category: 'activity' },
    { title: 'Flamenco show', category: 'activity' },
  )
  if (dest.includes('amsterdam')) out.push(
    { title: 'Rijksmuseum', category: 'sight' },
    { title: 'Anne Frank House', category: 'sight' },
    { title: 'Canal cruise', category: 'activity' },
    { title: 'Jordaan neighbourhood', category: 'activity' },
    { title: 'Keukenhof day trip', category: 'sight' },
    { title: 'Heineken brewery tour', category: 'activity' },
    { title: 'Vondelpark', category: 'activity' },
    { title: 'Dutch stroopwafels', category: 'food' },
  )
  if (dest.includes('new york') || dest.includes('nyc') || dest.includes('manhattan')) out.push(
    { title: 'Central Park', category: 'sight' },
    { title: 'The High Line', category: 'activity' },
    { title: 'Brooklyn Bridge', category: 'sight' },
    { title: 'MoMA', category: 'sight' },
    { title: 'Times Square', category: 'sight' },
    { title: 'Staten Island Ferry', category: 'activity' },
    { title: 'Chelsea Market', category: 'food' },
    { title: 'Broadway show', category: 'activity' },
    { title: 'Empire State Building', category: 'sight' },
    { title: 'Brooklyn food tour', category: 'food' },
  )
  if (dest.includes('dubai')) out.push(
    { title: 'Burj Khalifa', category: 'sight' },
    { title: 'Dubai Mall', category: 'shopping' },
    { title: 'Desert safari', category: 'activity' },
    { title: 'Old Dubai Creek', category: 'sight' },
    { title: 'Dubai Frame', category: 'sight' },
    { title: 'Palm Jumeirah', category: 'sight' },
    { title: 'Gold Souk', category: 'shopping' },
    { title: 'Dhow cruise dinner', category: 'food' },
  )
  if (dest.includes('bangkok') || dest.includes('thailand')) out.push(
    { title: 'Wat Pho', category: 'sight' },
    { title: 'Grand Palace', category: 'sight' },
    { title: 'Street food tour', category: 'food' },
    { title: 'Floating market', category: 'activity' },
    { title: 'Khao San Road', category: 'activity' },
    { title: 'Chatuchak weekend market', category: 'shopping' },
    { title: 'Elephant sanctuary', category: 'activity' },
    { title: 'Thai massage', category: 'activity' },
    { title: 'Pad Thai cooking class', category: 'activity' },
  )
  if (dest.includes('lisbon') || dest.includes('portugal')) out.push(
    { title: 'Alfama district', category: 'sight' },
    { title: 'Pastéis de Belém', category: 'food' },
    { title: 'Sintra day trip', category: 'activity' },
    { title: 'LX Factory', category: 'shopping' },
    { title: 'Tram 28', category: 'activity' },
    { title: 'Fado show', category: 'activity' },
    { title: 'Time Out Market', category: 'food' },
    { title: 'Jerónimos Monastery', category: 'sight' },
  )
  if (dest.includes('iceland') || dest.includes('reykjavik')) out.push(
    { title: 'Northern Lights tour', category: 'activity' },
    { title: 'Blue Lagoon', category: 'activity' },
    { title: 'Golden Circle', category: 'activity' },
    { title: 'Skógafoss waterfall', category: 'sight' },
    { title: 'Jökulsárlón glacier lagoon', category: 'sight' },
    { title: 'Geysir hot spring', category: 'sight' },
    { title: 'Whale watching', category: 'activity' },
    { title: 'Snorkelling in Silfra', category: 'activity' },
  )
  if (dest.includes('maldives')) out.push(
    { title: 'Snorkelling trip', category: 'activity' },
    { title: 'Sunrise kayaking', category: 'activity' },
    { title: 'Overwater dinner', category: 'food' },
    { title: 'Dolphin cruise', category: 'activity' },
    { title: 'Scuba diving', category: 'activity' },
    { title: 'Bioluminescent beach', category: 'sight' },
  )
  if (dest.includes('hong kong')) out.push(
    { title: 'Victoria Peak', category: 'sight' },
    { title: 'Dim sum breakfast', category: 'food' },
    { title: 'Star Ferry', category: 'activity' },
    { title: 'Temple Street Market', category: 'shopping' },
    { title: 'Lantau Island & Big Buddha', category: 'sight' },
    { title: 'Mong Kok street food', category: 'food' },
    { title: 'Skyline light show', category: 'sight' },
  )
  if (dest.includes('milan') || dest.includes('italy')) out.push(
    { title: 'Duomo di Milano', category: 'sight' },
    { title: 'The Last Supper', category: 'sight' },
    { title: 'Brera district', category: 'activity' },
    { title: 'Aperitivo hour', category: 'food' },
    { title: 'Galleria Vittorio Emanuele', category: 'shopping' },
    { title: 'Navigli canals', category: 'activity' },
  )
  if (dest.includes('sydney') || dest.includes('australia')) out.push(
    { title: 'Sydney Opera House', category: 'sight' },
    { title: 'Bondi Beach', category: 'activity' },
    { title: 'Harbour Bridge climb', category: 'activity' },
    { title: 'Royal Botanic Garden', category: 'sight' },
    { title: 'Manly Ferry ride', category: 'activity' },
    { title: 'Blue Mountains day trip', category: 'sight' },
    { title: 'Darling Harbour', category: 'activity' },
  )
  if (dest.includes('vienna') || dest.includes('austria')) out.push(
    { title: 'Schönbrunn Palace', category: 'sight' },
    { title: 'Vienna State Opera', category: 'activity' },
    { title: 'Belvedere museum', category: 'sight' },
    { title: 'Naschmarkt', category: 'food' },
    { title: 'Prater & Riesenrad', category: 'activity' },
    { title: 'Viennese coffee house', category: 'food' },
    { title: 'Kunsthistorisches Museum', category: 'sight' },
  )
  if (dest.includes('prague') || dest.includes('czech')) out.push(
    { title: 'Prague Castle', category: 'sight' },
    { title: 'Charles Bridge', category: 'sight' },
    { title: 'Old Town Square', category: 'sight' },
    { title: 'Czech beer tasting', category: 'food' },
    { title: 'Astronomical Clock', category: 'sight' },
    { title: 'Jewish Quarter', category: 'sight' },
    { title: 'Trdelník pastry', category: 'food' },
  )
  if (dest.includes('budapest') || dest.includes('hungary')) out.push(
    { title: 'Parliament Building', category: 'sight' },
    { title: 'Széchenyi thermal baths', category: 'activity' },
    { title: 'Ruin bars', category: 'activity' },
    { title: "Fisherman's Bastion", category: 'sight' },
    { title: 'Buda Castle', category: 'sight' },
    { title: 'Great Market Hall', category: 'shopping' },
    { title: 'Danube cruise', category: 'activity' },
  )
  if (dest.includes('berlin') || dest.includes('germany')) out.push(
    { title: 'Brandenburg Gate', category: 'sight' },
    { title: 'Berlin Wall memorial', category: 'sight' },
    { title: 'Museum Island', category: 'sight' },
    { title: 'Checkpoint Charlie', category: 'sight' },
    { title: 'Currywurst', category: 'food' },
    { title: 'Tiergarten park', category: 'activity' },
    { title: 'Kreuzberg neighbourhood', category: 'activity' },
    { title: 'Reichstag dome', category: 'sight' },
  )
  if (dest.includes('istanbul') || dest.includes('turkey')) out.push(
    { title: 'Hagia Sophia', category: 'sight' },
    { title: 'Grand Bazaar', category: 'shopping' },
    { title: 'Blue Mosque', category: 'sight' },
    { title: 'Bosphorus cruise', category: 'activity' },
    { title: 'Topkapi Palace', category: 'sight' },
    { title: 'Turkish hammam', category: 'activity' },
    { title: 'Baklava tasting', category: 'food' },
    { title: 'Spice Bazaar', category: 'shopping' },
  )
  if (dest.includes('cairo') || dest.includes('egypt')) out.push(
    { title: 'Pyramids of Giza', category: 'sight' },
    { title: 'Egyptian Museum', category: 'sight' },
    { title: 'Khan el-Khalili bazaar', category: 'shopping' },
    { title: 'Nile cruise', category: 'activity' },
    { title: 'Camel ride', category: 'activity' },
    { title: 'Luxor day trip', category: 'sight' },
  )
  if (dest.includes('marrakech') || dest.includes('morocco')) out.push(
    { title: 'Djemaa el-Fna square', category: 'sight' },
    { title: 'Medina souks', category: 'shopping' },
    { title: 'Majorelle Garden', category: 'sight' },
    { title: 'Hammam & spa', category: 'activity' },
    { title: 'Moroccan cooking class', category: 'activity' },
    { title: 'Desert day trip', category: 'activity' },
    { title: 'Mint tea ceremony', category: 'food' },
  )
  if (dest.includes('cape town') || dest.includes('south africa')) out.push(
    { title: 'Table Mountain', category: 'sight' },
    { title: 'Boulders Beach penguins', category: 'sight' },
    { title: 'Cape Peninsula drive', category: 'activity' },
    { title: 'V&A Waterfront', category: 'shopping' },
    { title: 'Wine tasting in Stellenbosch', category: 'activity' },
    { title: 'Robben Island tour', category: 'sight' },
  )
  if (dest.includes('rio') || dest.includes('brazil')) out.push(
    { title: 'Christ the Redeemer', category: 'sight' },
    { title: 'Sugarloaf Mountain', category: 'sight' },
    { title: 'Copacabana beach', category: 'activity' },
    { title: 'Ipanema beach', category: 'activity' },
    { title: 'Favela tour', category: 'activity' },
    { title: 'Caipirinha tasting', category: 'food' },
  )
  if (dest.includes('copenhagen') || dest.includes('denmark')) out.push(
    { title: 'Nyhavn harbour', category: 'sight' },
    { title: 'Tivoli Gardens', category: 'activity' },
    { title: 'The Little Mermaid', category: 'sight' },
    { title: 'Freetown Christiania', category: 'activity' },
    { title: 'Smørrebrød lunch', category: 'food' },
    { title: 'National Museum', category: 'sight' },
  )
  if (dest.includes('stockholm') || dest.includes('sweden')) out.push(
    { title: 'Gamla Stan old town', category: 'sight' },
    { title: 'Vasa Museum', category: 'sight' },
    { title: 'ABBA Museum', category: 'sight' },
    { title: 'Djurgården island', category: 'activity' },
    { title: 'Swedish fika', category: 'food' },
    { title: 'Skansen open-air museum', category: 'sight' },
  )
  if (dest.includes('mumbai') || (dest.includes('india') && !dest.includes('delhi') && !dest.includes('jaipur'))) out.push(
    { title: 'Gateway of India', category: 'sight' },
    { title: 'Elephanta Caves', category: 'sight' },
    { title: 'Dharavi tour', category: 'activity' },
    { title: 'Colaba Causeway', category: 'shopping' },
    { title: 'Street food at Juhu Beach', category: 'food' },
    { title: 'Bollywood studio tour', category: 'activity' },
  )
  if (dest.includes('delhi')) out.push(
    { title: 'Red Fort', category: 'sight' },
    { title: 'Qutub Minar', category: 'sight' },
    { title: 'Chandni Chowk street food', category: 'food' },
    { title: "Humayun's Tomb", category: 'sight' },
    { title: 'India Gate', category: 'sight' },
    { title: 'Jama Masjid mosque', category: 'sight' },
  )
  if (dest.includes('vietnam') || dest.includes('hanoi') || dest.includes('ho chi minh') || dest.includes('saigon')) out.push(
    { title: 'Ha Long Bay cruise', category: 'activity' },
    { title: 'Hoi An Ancient Town', category: 'sight' },
    { title: 'Pho for breakfast', category: 'food' },
    { title: 'Moped tour', category: 'activity' },
    { title: 'War Remnants Museum', category: 'sight' },
    { title: 'Vietnamese cooking class', category: 'activity' },
    { title: 'Banh mi tasting', category: 'food' },
  )
  if (dest.includes('kuala lumpur') || dest.includes('malaysia') || dest.includes(' kl')) out.push(
    { title: 'Petronas Towers', category: 'sight' },
    { title: 'Batu Caves', category: 'sight' },
    { title: 'Bukit Bintang food court', category: 'food' },
    { title: 'Menara KL Tower', category: 'sight' },
    { title: 'Petaling Street', category: 'shopping' },
    { title: 'Nasi lemak breakfast', category: 'food' },
  )
  if (dest.includes('athens') || (dest.includes('greece') && !dest.includes('santorini') && !dest.includes('mykonos'))) out.push(
    { title: 'Acropolis & Parthenon', category: 'sight' },
    { title: 'Acropolis Museum', category: 'sight' },
    { title: 'Plaka neighbourhood', category: 'activity' },
    { title: 'Monastiraki flea market', category: 'shopping' },
    { title: 'Greek mezze dinner', category: 'food' },
    { title: 'Temple of Zeus', category: 'sight' },
  )
  if (dest.includes('santorini')) out.push(
    { title: 'Oia sunset', category: 'sight' },
    { title: 'Caldera boat trip', category: 'activity' },
    { title: 'Black sand beach', category: 'activity' },
    { title: 'Wine tasting', category: 'food' },
    { title: 'Fira cable car', category: 'activity' },
    { title: 'Akrotiri ruins', category: 'sight' },
  )
  if (dest.includes('edinburgh') || dest.includes('scotland')) out.push(
    { title: 'Edinburgh Castle', category: 'sight' },
    { title: "Arthur's Seat hike", category: 'activity' },
    { title: 'Royal Mile walk', category: 'activity' },
    { title: 'Scotch whisky tasting', category: 'food' },
    { title: 'Scottish Highlands day trip', category: 'sight' },
    { title: 'Palace of Holyroodhouse', category: 'sight' },
  )
  if (dest.includes('dublin') || dest.includes('ireland')) out.push(
    { title: 'Guinness Storehouse', category: 'activity' },
    { title: 'Trinity College & Book of Kells', category: 'sight' },
    { title: 'Temple Bar', category: 'activity' },
    { title: 'Cliffs of Moher day trip', category: 'sight' },
    { title: 'Irish pub session', category: 'activity' },
    { title: 'Kilkenny day trip', category: 'sight' },
  )
  if (dest.includes('queenstown') || dest.includes('new zealand')) out.push(
    { title: 'Bungee jumping', category: 'activity' },
    { title: 'Milford Sound cruise', category: 'activity' },
    { title: 'Remarkables ski resort', category: 'activity' },
    { title: 'Skydiving over Queenstown', category: 'activity' },
    { title: 'Lake Wakatipu cruise', category: 'activity' },
    { title: 'Hobbiton movie set', category: 'sight' },
  )

  return out
}

export default function NotesTab({ trip }: { trip: Trip }) {
  const tripId = trip.id
  const { notes, addNote, toggleNote, deleteNote } = useTripNotes(tripId)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('sight')
  const [noteText, setNoteText] = useState('')

  const destinations = trip.destinations ?? [trip.destination]
  const destWishlist = useMemo(() => getDestWishlist(destinations), [destinations.join(',')])
  const unaddedWishlist = destWishlist.filter(s =>
    !notes.some(n => n.title.toLowerCase() === s.title.toLowerCase())
  )

  const sorted = [...notes].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return b.createdAt - a.createdAt
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    if (!notes.some(n => n.title.toLowerCase() === trimmed.toLowerCase())) {
      await addNote({ title: trimmed, category, notes: noteText.trim(), done: false })
    }
    setTitle(''); setNoteText(''); setCategory('sight'); setShowForm(false)
  }

  return (
    <div className="pb-6">
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <h1 className="font-display italic text-4xl text-white leading-none">Wishlist</h1>
          <p className="text-slate-400 text-sm mt-1">Places to visit · things to do</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white mt-1 shrink-0">
          <Plus size={18} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mx-4 mb-4 bg-slate-900 rounded-2xl p-4 space-y-3"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
          <input
            autoFocus
            placeholder="What do you want to do?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            style={{ fontSize: 16 }}
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button"
                onClick={() => setCategory(c.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ background: category === c.key ? '#e76a55' : '#152d48', color: '#fff' }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <input
            placeholder="Notes (optional)"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            style={{ fontSize: 16 }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 h-10 rounded-2xl text-slate-400 text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold"
              style={{ background: '#e76a55' }}>
              Add
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showForm && (
        <div className="flex flex-col items-center py-12 px-5 text-center">
          <p className="font-display italic text-2xl text-slate-600">Nothing planned yet</p>
          <p className="text-slate-600 text-sm mt-2">Add places to visit, restaurants to try, things to do.</p>
        </div>
      )}

      <div className="px-4 space-y-2">
        {sorted.map(note => {
          const cat = CATEGORIES.find(c => c.key === note.category)
          return (
            <div key={note.id}
              className="flex items-start gap-3 bg-slate-900 rounded-2xl px-4 py-3.5"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)', opacity: note.done ? 0.5 : 1 }}>
              <button
                onClick={() => toggleNote(note.id, !note.done)}
                className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                style={{ borderColor: note.done ? '#e76a55' : 'rgba(255,255,255,0.2)', background: note.done ? '#e76a55' : 'transparent' }}>
                {note.done && <Check size={12} color="#fff" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${note.done ? 'line-through text-slate-500' : 'text-white'}`}>
                  {cat?.emoji} {note.title}
                </p>
                {note.notes && <p className="text-xs text-slate-500 mt-0.5">{note.notes}</p>}
              </div>
              <button onClick={() => deleteNote(note.id)} className="text-slate-700 hover:text-red-400 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {unaddedWishlist.length > 0 && (
        <div className="px-4 mt-5">
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest mb-2">
            Ideas for {destinations.map(d => d.split(',')[0].trim()).join(' · ')}
          </p>
          <div className="space-y-2">
            {unaddedWishlist.map(s => {
              const cat = CATEGORIES.find(c => c.key === s.category)
              return (
                <button key={s.title} type="button"
                  onClick={() => addNote({ title: s.title, category: s.category, notes: '', done: false })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
                  style={{ background: '#0c1b30', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <span>{cat?.emoji}</span>
                  <span className="flex-1 text-sm text-white">{s.title}</span>
                  <span className="text-xs text-slate-500 shrink-0">+ Add</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
