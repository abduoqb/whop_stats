import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Plus,
  Menu,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gift
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  addMonths, 
  subMonths,
  getYear,
  getMonth,
  setMonth,
  setYear,
  eachDayOfInterval,
  isWithinInterval,
  isBefore,
  isAfter,
  startOfYear,
  startOfQuarter
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  transactionsData, 
  calculateStats, 
  getDailyChartData, 
  getDailyRefundCountData 
} from './transactionsData'

// Import des icônes SVG personnalisées
import AccueilIcon from './icons/acceuil_icon.svg?react'
import DiscoverIcon from './icons/discover_icon.svg?react'
import MessagesIcon from './icons/messages_icon.svg?react'
import NotificationsIcon from './icons/notifications_icon.svg?react'
import EntrepriseIcon from './icons/cree_entreprise_icon.svg?react'
import AffiliesIcon from './icons/affilies_icon.svg?react'
import FinanceIcon from './icons/finance_icon.svg?react'
import RechercheIcon from './icons/recherche_icon.svg?react'
import LogoIcon from './icons/logo_icon.svg?react'
import LogoDoc from './icons/logo_doc.avif'
import WhopText from './icons/whop_ecriture.svg?react'

// Noms des mois pour le select
const MONTHS_FR_FULL = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
]

// Fonction de formatage de devise
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num) + ' $US'
}

// Fonction de formatage d'entier
const formatInteger = (value) => {
  const num = parseInt(value) || 0
  return new Intl.NumberFormat('fr-FR').format(num)
}

// Fonction de formatage de date courte pour l'affichage
const formatDateForDisplay = (date) => {
  return format(date, 'd MMM. yyyy', { locale: fr })
}

// Composant TinyChart (Sparkline avec Recharts) - INCHANGÉ
const TinyChart = ({ data, hasData = false }) => {
  if (!hasData || !data || data.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="text-zinc-500 text-xs bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
          Aucune donnée disponible
        </div>
      </div>
    )
  }

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="90%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide={true} />
          <YAxis hide={true} domain={['auto', 'auto']} />
          <Area
            type="linear"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#blueGradient)"
            isAnimationActive={true}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Menu déroulant des préréglages (Presets Dropdown)
const PresetsDropdown = ({ isOpen, onClose, selectedPreset, onPresetChange }) => {
  if (!isOpen) return null

  const presets = [
    "Aujourd'hui",
    '7 derniers jours',
    '4 dernières semaines',
    '3 derniers mois',
    '12 derniers mois',
    'Depuis le début du mois',
    'Trimestre en cours',
    'Année en cours'
  ]

  return (
    <div className="absolute top-full left-0 mt-1 bg-[#191919] border border-[#4E4E4E] rounded-xl shadow-2xl z-50 p-1.5 min-w-[200px]">
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => {
            onPresetChange(preset)
            onClose()
          }}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors mb-0.5 last:mb-0 ${
            selectedPreset === preset
              ? 'text-white'
              : 'text-zinc-300 hover:text-white hover:bg-[#313131]'
          }`}
        >
          {preset}
        </button>
      ))}
    </div>
  )
}

// Calendrier popup (Calendar Picker) - Style exact de l'image
const CalendarPopup = ({ 
  isOpen, 
  onClose, 
  tempStart, 
  tempEnd, 
  onTempStartChange, 
  onTempEndChange,
  onApply 
}) => {
  if (!isOpen) return null

  const [currentMonth, setCurrentMonth] = useState(tempEnd || new Date())
  const [selectionMode, setSelectionMode] = useState('start')

  const handleMonthChange = (offset) => {
    setCurrentMonth(addMonths(currentMonth, offset))
  }

  const handleSelectMonthChange = (monthIndex) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(monthIndex)))
  }

  const handleYearChange = (year) => {
    setCurrentMonth(setYear(currentMonth, parseInt(year)))
  }

  const handleDayClick = (day) => {
    if (selectionMode === 'start') {
      onTempStartChange(day)
      onTempEndChange(day)
      setSelectionMode('end')
    } else {
      if (isBefore(day, tempStart)) {
        onTempStartChange(day)
        onTempEndChange(tempStart)
      } else {
        onTempEndChange(day)
      }
      setSelectionMode('start')
    }
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map((day, idx) => {
      const isCurrentMonth = isSameMonth(day, currentMonth)
      const isSelectedStart = tempStart && isSameDay(day, tempStart)
      const isSelectedEnd = tempEnd && isSameDay(day, tempEnd)
      const isInRange = tempStart && tempEnd && 
        isWithinInterval(day, { start: tempStart, end: tempEnd }) && 
        !isSelectedStart && !isSelectedEnd

      // Déterminer les classes de style
      let containerClass = 'relative'
      let dayClass = 'h-9 w-full flex items-center justify-center text-sm transition-colors cursor-pointer relative z-10'
      
      // Fond pour la plage (connecteur)
      let rangeBackground = null

      if (!isCurrentMonth) {
        dayClass += ' text-zinc-600'
      } else if (isSelectedStart || isSelectedEnd) {
        dayClass += ' bg-blue-600 text-white font-medium'
        if (isSelectedStart && isSelectedEnd && isSameDay(tempStart, tempEnd)) {
          dayClass += ' rounded-lg'
        } else if (isSelectedStart) {
          dayClass += ' rounded-l-lg'
        } else if (isSelectedEnd) {
          dayClass += ' rounded-r-lg'
        }
      } else if (isInRange) {
        dayClass += ' bg-blue-600/30 text-white'
      } else {
        dayClass += ' text-zinc-300 hover:bg-zinc-800 rounded-lg'
      }

      return (
        <div key={idx} className={containerClass}>
          <button
            onClick={() => handleDayClick(day)}
            className={dayClass}
          >
            {format(day, 'd')}
          </button>
        </div>
      )
    })
  }

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i)

  return (
    <div className="absolute top-full right-0 mt-2 bg-[#191919] border border-zinc-700/50 rounded-xl shadow-2xl z-50 p-4 w-[340px]">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => handleMonthChange(-1)} 
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center gap-2">
          {/* Select Mois */}
          <div className="relative">
            <select 
              value={getMonth(currentMonth)} 
              onChange={(e) => handleSelectMonthChange(e.target.value)}
              className="appearance-none bg-[#131313] border border-[#131313] hover:border-zinc-700 px-3 py-1.5 pr-8 rounded-lg cursor-pointer text-sm text-white outline-none transition-colors"
            >
              {MONTHS_FR_FULL.map((m, i) => (
                <option key={i} value={i} className="bg-[#131313]">{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Select Année */}
          <div className="relative">
            <select 
              value={getYear(currentMonth)} 
              onChange={(e) => handleYearChange(e.target.value)}
              className="appearance-none bg-[#131313] border border-[#131313] hover:border-zinc-700 px-3 py-1.5 pr-8 rounded-lg cursor-pointer text-sm text-white outline-none transition-colors"
            >
              {years.map(y => (
                <option key={y} value={y} className="bg-[#131313]">{y}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        <button 
          onClick={() => handleMonthChange(1)} 
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="h-9 w-full flex items-center justify-center text-xs text-zinc-500 font-bold">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-0 mb-4">
        {renderCalendarDays()}
      </div>

      {/* Footer avec boutons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button 
          onClick={onClose}
          className="px-6 py-2 text-sm font-medium text-white bg-transparent hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-700"
        >
          Annuler
        </button>
        <button 
          onClick={() => {
            onApply()
            onClose()
          }}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
        >
          Définir
        </button>
      </div>
    </div>
  )
}

// Composant Sidebar
const Sidebar = () => {
  const menuItems = [
    { icon: AccueilIcon, label: 'Accueil', active: false },
    { icon: DiscoverIcon, label: 'Discover', active: false },
    { icon: MessagesIcon, label: 'Messages', active: false },
    { icon: NotificationsIcon, label: 'Notifications', active: false },
    { icon: EntrepriseIcon, label: 'Créer une entreprise', active: false },
    { icon: AffiliesIcon, label: 'Affiliés', active: true },
    { icon: FinanceIcon, label: 'Finance', active: false },
    { icon: User, label: 'Profil', active: false },
  ]

  return (
    <aside className="w-[280px] bg-black border-r border-zinc-900 flex flex-col h-screen fixed left-0 top-0 font-sans">
      <div className="px-6 py-6 flex items-center gap-3">
        <LogoIcon className="w-7 h-7" />
        <WhopText className="h-[20px] w-auto text-white" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item, index) => (
          <a 
            key={index} 
            href="#" 
            className={`group flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all ${
              item.active 
                ? 'bg-[#313131] text-white shadow-sm' 
                : 'text-[#B4B4B4] hover:bg-[#313131] hover:text-white'
            }`}
          >
            <item.icon className={`w-[22px] h-[22px] transition-colors ${
              item.active ? 'text-white' : 'text-[#B4B4B4] group-hover:text-white'
            }`} />
            <span className="text-[17px] font-semibold">{item.label}</span>
          </a>
        ))}

        <div className="mt-8 mb-3 px-3 flex items-center justify-between group cursor-pointer">
          <span className="text-[12px] text-[#B4B4B4] font-bold tracking-widest uppercase">Vos Whops</span>
          <RechercheIcon className="w-4 h-4 text-[#B4B4B4] group-hover:text-white transition-colors" />
        </div>

        <a href="#" className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-[#B4B4B4] hover:bg-[#313131] hover:text-white transition-colors">
          <img src={LogoDoc} alt="D.O.C" className="w-5 h-5 rounded-md object-cover" />
          <span className="text-[17px] font-semibold">D.O.C Partners</span>
        </a>

        <a href="#" className="group flex items-center gap-3 px-5 py-3.5 rounded-xl text-[#B4B4B4] hover:bg-[#313131] hover:text-white transition-colors">
          <div className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center transition-colors group-hover:bg-zinc-700">
            <Plus size={16} strokeWidth={2} className="text-[#B4B4B4] group-hover:text-white" />
          </div>
          <span className="text-[17px] font-semibold">Nouvelle activité</span>
        </a>
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <a href="#" className="flex items-center gap-3 px-5 py-3.5 text-[#B4B4B4] hover:text-white transition-colors rounded-xl hover:bg-[#313131]">
          <Menu size={20} strokeWidth={1.5} />
          <span className="text-[17px] font-semibold">Menu</span>
          <div className="ml-auto w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center">
            <span className="text-[10px] text-[#B4B4B4] font-medium">?</span>
          </div>
        </a>
      </div>
    </aside>
  )
}

// Composant StatCard
const StatCard = ({ title, value, isInteger = false, chartData, dateRange }) => {
  const formattedValue = isInteger ? formatInteger(value) : formatCurrency(value)
  const hasData = chartData && chartData.some(d => d.value > 0)

  return (
    <div className="bg-[#181818] border border-whop-border rounded-xl p-4 hover:border-zinc-700/50 transition-colors">
      <div className="text-zinc-400 text-[13px] font-normal mb-1">{title}</div>
      <div className="text-[22px] font-semibold text-white mb-3 tracking-tight">{formattedValue}</div>
      <TinyChart data={chartData} hasData={hasData} />
      {dateRange && (
        <div className="flex justify-between text-[11px] text-zinc-600 mt-3 pt-2">
          <span>{dateRange.start}</span>
          <span>{dateRange.end}</span>
        </div>
      )}
    </div>
  )
}

// Composant Principal App
function App() {
  // États pour les deux dropdowns séparés
  const [isPresetsOpen, setIsPresetsOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState('7 derniers jours')
  
  const presetsRef = useRef(null)
  const calendarRef = useRef(null)

  // États pour les dates personnalisées
  const [customStartDate, setCustomStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  })
  const [customEndDate, setCustomEndDate] = useState(new Date())

  // États temporaires pour le calendrier
  const [tempStart, setTempStart] = useState(customStartDate)
  const [tempEnd, setTempEnd] = useState(customEndDate)

  const calculateDateRange = (preset) => {
    const today = new Date()
    let startDate = new Date()

    switch (preset) {
      case "Aujourd'hui": startDate = today; break
      case '7 derniers jours': startDate = addDays(today, -6); break
      case '4 dernières semaines': startDate = addDays(today, -27); break
      case '3 derniers mois': startDate = subMonths(today, 3); break
      case '12 derniers mois': startDate = subMonths(today, 12); break
      case 'Depuis le début du mois': startDate = startOfMonth(today); break
      case 'Trimestre en cours': startDate = startOfQuarter(today); break
      case 'Année en cours': startDate = startOfYear(today); break
      case 'Personnalisé':
        return {
          startDate: customStartDate,
          endDate: customEndDate,
          displayString: `${formatDateForDisplay(customStartDate)} - ${formatDateForDisplay(customEndDate)}`
        }
      default: startDate = addDays(today, -6)
    }

    return {
      startDate,
      endDate: today,
      displayString: `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(today)}`
    }
  }

  const currentDateRange = useMemo(() => calculateDateRange(selectedPreset), [selectedPreset, customStartDate, customEndDate])
  const stats = useMemo(() => calculateStats(currentDateRange.startDate, currentDateRange.endDate, transactionsData), [currentDateRange])
  
  const commissionChartData = useMemo(() => getDailyChartData(currentDateRange.startDate, currentDateRange.endDate, 'commission'), [currentDateRange])
  const refundBrutChartData = useMemo(() => getDailyChartData(currentDateRange.startDate, currentDateRange.endDate, 'refund'), [currentDateRange])
  const refundCountChartData = useMemo(() => getDailyRefundCountData(currentDateRange.startDate, currentDateRange.endDate), [currentDateRange])
  const referralChartData = useMemo(() => getDailyChartData(currentDateRange.startDate, currentDateRange.endDate, 'referral'), [currentDateRange])
  const revenueChartData = useMemo(() => getDailyChartData(currentDateRange.startDate, currentDateRange.endDate, 'revenue'), [currentDateRange])

  const displayedDateRange = useMemo(() => ({
    start: formatDateForDisplay(currentDateRange.startDate),
    end: "Aujourd'hui"
  }), [currentDateRange])

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset)
    // Recalculer les dates pour le preset
    const range = calculateDateRange(preset)
    setCustomStartDate(range.startDate)
    setCustomEndDate(range.endDate)
    setTempStart(range.startDate)
    setTempEnd(range.endDate)
  }

  const handleCalendarApply = () => {
    setCustomStartDate(tempStart)
    setCustomEndDate(tempEnd)
    setSelectedPreset('Personnalisé')
  }

  const handleCalendarOpen = () => {
    setTempStart(customStartDate)
    setTempEnd(customEndDate)
    setIsCalendarOpen(true)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (presetsRef.current && !presetsRef.current.contains(event.target)) {
        setIsPresetsOpen(false)
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-[#111111] font-sans">
      <Sidebar />

      <main className="ml-[280px] min-h-screen ">
        {/* Header */}
        <header className="border-b border-zinc-800/50 px-6 py-4 bg-[#111111] sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-white tracking-tight">Affiliates</h1>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#d4a853]/20 via-[#d4a853]/5 to-transparent border border-[#d4a853]/30 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-[#d4a853]/10 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#d4a853]">
                  <path d="M5.93457 1C6.79227 1 7.56448 1.44883 8 2.14746C8.43552 1.44883 9.20773 1 10.0654 1H10.25C11.4926 1 12.5 2.00736 12.5 3.25C12.5 3.51996 12.4495 3.77774 12.3623 4.01758H13.4902C14.324 4.0177 14.9999 4.69358 15 5.52734V6.99902C14.9999 7.65359 14.5825 8.20861 14 8.41797V12.8799C14 14.0507 13.0507 15 11.8799 15H4.12012C2.94927 15 2 14.0507 2 12.8799V8.41797C1.41749 8.20861 1.0001 7.65359 1 6.99902V5.52734C1.00013 4.69358 1.676 4.0177 2.50977 4.01758H3.6377C3.55052 3.77774 3.5 3.51996 3.5 3.25C3.5 2.00736 4.50736 1 5.75 1H5.93457ZM3.5 12.8799C3.5 13.2223 3.7777 13.5 4.12012 13.5H7.25V8.50879H3.5V12.8799ZM8.75 13.5H11.8799C12.2223 13.5 12.5 13.2223 12.5 12.8799V8.50879H8.75V13.5ZM2.5 5.52344V7.00293L2.50586 7.00879H7.25V5.51758H2.50586L2.5 5.52344ZM8.75 7.00879H13.4941L13.5 7.00293V5.52344L13.4941 5.51758H8.75V7.00879ZM5.75 2.5C5.33579 2.5 5 2.83579 5 3.25C5 3.66421 5.33579 4 5.75 4H7.04004L6.8418 3.20801C6.73778 2.79193 6.36345 2.5 5.93457 2.5H5.75ZM10.0654 2.5C9.63655 2.5 9.26222 2.79193 9.1582 3.20801L8.95996 4H10.25C10.6642 4 11 3.66421 11 3.25C11 2.83579 10.6642 2.5 10.25 2.5H10.0654Z" fill="currentColor"></path>
                </svg>
                Place de marché d'affiliation
              </button>
              
              <button className="border border-zinc-700 px-3 py-1.5 rounded-lg text-sm text-[#86B5FF] font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors">
                Faire une demande pour devenir partenaire
              </button>
              
              <button className="text-zinc-500 hover:text-white transition-colors">
                <div className="w-5 h-5 rounded-full border border-zinc-600 flex items-center justify-center">
                  <span className="text-[11px]">?</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-white text-sm font-medium pb-2 border-b-2 border-blue-500">Tableau de bord</button>
            <button className="text-zinc-500 text-sm font-medium hover:text-zinc-300 transition-colors pb-2 border-b-2 border-transparent">Recommander des acheteurs</button>
            <button className="text-zinc-500 text-sm font-medium hover:text-zinc-300 transition-colors pb-2 border-b-2 border-transparent">Recommander des vendeurs</button>
          </div>
        </header>

        {/* Barre de filtres */}
        <div className="px-6 py-6 flex items-center gap-4 border-zinc-800/50 sticky top-[73px] z-10 bg-[#111111]/95 backdrop-blur-sm">
          {/* Sélecteur entreprises */}
          <button className="flex items-center gap-2 bg-[#191919] border border-[#4E4E4E] px-4 py-2 rounded-lg text-sm text-white hover:bg-zinc-800 transition-colors">
            Toutes les entreprises
            <ChevronDown size={14} className="text-zinc-500" />
          </button>
          
          <span className="text-zinc-500 text-sm">dans</span>

          {/* Groupe Date (Presets + Calendrier) */}
          <div className="flex items-center bg-[#191919] border border-[#4E4E4E] rounded-lg">
            {/* Sélecteur de période (Presets) */}
            <div className="relative" ref={presetsRef}>
              <button 
                onClick={() => setIsPresetsOpen(!isPresetsOpen)} 
                className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-800 rounded-l-lg transition-colors border-r border-[#4E4E4E]"
              >
                {selectedPreset === 'Personnalisé' ? 'Personnalisé' : selectedPreset}
                <ChevronDown size={14} className="text-zinc-500" />
              </button>
              
              <PresetsDropdown 
                isOpen={isPresetsOpen}
                onClose={() => setIsPresetsOpen(false)}
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
              />
            </div>

            {/* Bouton Date avec calendrier */}
            <div className="relative" ref={calendarRef}>
              <button 
                onClick={handleCalendarOpen}
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-r-lg transition-colors"
              >
                <Calendar size={14} />
                <span>{currentDateRange.displayString}</span>
              </button>

              <CalendarPopup 
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                tempStart={tempStart}
                tempEnd={tempEnd}
                onTempStartChange={setTempStart}
                onTempEndChange={setTempEnd}
                onApply={handleCalendarApply}
              />
            </div>
          </div>
        </div>

        {/* Grille des cartes */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <StatCard title="Commission nette" value={stats.commission} chartData={commissionChartData} dateRange={displayedDateRange} />
            <StatCard title="Remboursements et litiges (Brut)" value={stats.refundsBrut} chartData={refundBrutChartData} dateRange={displayedDateRange} />
            <StatCard title="Remboursements et litiges (Nombre)" value={stats.refundsCount} isInteger={true} chartData={refundCountChartData} dateRange={displayedDateRange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Utilisateurs référencés" value={stats.users} isInteger={true} chartData={referralChartData} dateRange={displayedDateRange} />
            <StatCard title="Recettes produites" value={stats.revenue} chartData={revenueChartData} dateRange={displayedDateRange} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
