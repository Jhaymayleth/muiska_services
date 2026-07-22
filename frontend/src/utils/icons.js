import { MapPin, Phone, Calendar, Star, BadgeCheck, Compass, Shirt, Utensils, Laptop, Home, Palette, Stethoscope, BookOpen, Wrench, Package, User, Search, Handshake } from 'lucide'

function iconSvg(node, size) {
  let inner = ''
  for (const [tag, attrs] of node) {
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
    inner += `<${tag} ${attrStr}></${tag}>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

const iconNodes = {
  dress: Shirt,
  food: Utensils,
  tech: Laptop,
  home: Home,
  art: Palette,
  health: Stethoscope,
  education: BookOpen,
  services: Wrench,
  package: Package,
  calendar: Calendar,
  location: MapPin,
  phone: Phone,
  verified: BadgeCheck,
  star: Star,
  distance: Compass,
  user: User,
  search: Search,
  handshake: Handshake,
}

export const getIcon = (name, size = 20) => {
  const node = iconNodes[name]
  return node ? iconSvg(node, size) : ''
}

export const getCategoryIcon = (name) => {
  const lower = name.toLowerCase()
  if (lower.includes('clothing') || lower.includes('fashion')) return getIcon('dress', 28)
  if (lower.includes('food') || lower.includes('beverage')) return getIcon('food', 28)
  if (lower.includes('electronics') || lower.includes('tech')) return getIcon('tech', 28)
  if (lower.includes('home') || lower.includes('garden') || lower.includes('real estate')) return getIcon('home', 28)
  if (lower.includes('art') || lower.includes('craft')) return getIcon('art', 28)
  if (lower.includes('health') || lower.includes('beauty')) return getIcon('health', 28)
  if (lower.includes('education')) return getIcon('education', 28)
  if (lower.includes('service')) return getIcon('services', 28)
  return getIcon('package', 28)
}

export default iconNodes
