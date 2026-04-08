import { useState, useCallback, useEffect } from 'react'
import CalendarGrid from './CalendarGrid'
import NotesPanel from './NotesPanel'
import './CalendarCard.css'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function useCurrentTime() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return time
}

export default function CalendarCard() {
  const today = useCurrentTime()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)
  
  const [themeIndex, setThemeIndex] = useState(0)
  const themes = ['theme-obsidian', 'theme-sunset', 'theme-aurora']

  const [isJournalOpen, setIsJournalOpen] = useState(true)

  const prevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11 }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0 }
      return m + 1
    })
  }, [])

  const handleDayClick = useCallback((date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date); setEndDate(null)
    } else {
      if (date < startDate) {
        setEndDate(startDate); setStartDate(date)
      } else {
        setEndDate(date)
      }
    }
  }, [startDate, endDate])

  const clearSelection = useCallback(() => {
    setStartDate(null); setEndDate(null); setHoverDate(null)
  }, [])

  return (
    <div className={`premium-app-container ${themes[themeIndex]}`}>
      
      <div className="cinematic-backdrop">
        <img src="/hero.png" aria-hidden="true" alt="" />
      </div>

      <main className="luxury-planner-binder">
        
        {/* ── 1. IMAGE PANEL ── */}
        <section className="binder-page visual-panel">
          <img src="/hero.png" alt="Scenery" className="hero-artwork" />
          <div className="artwork-overlay" />
          
          <div className="bento-clock-glass">
            <h2 className="clock-time">
              {today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <p className="clock-date">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button 
            className="glass-icon-btn theme-toggle-btn" 
            onClick={() => setThemeIndex((prev) => (prev + 1) % themes.length)}
            title="Cycle Theme"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
          </button>
        </section>

        {/* ── SPIRAL BINDING (Desktop Only) ── */}
        <div className="physical-spiral-binding">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="metal-ring-assembly">
              <div className="paper-hole left-hole" />
              <div className="titanium-coil" />
              <div className="paper-hole right-hole" />
            </div>
          ))}
        </div>

        {/* ── 2. CALENDAR PANEL ── */}
        <section className="binder-page calendar-panel">
          <header className="calendar-header-nav">
            <button className="glass-icon-btn nav-arrow" onClick={prevMonth}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            
            <div className="month-display-hero">
              <h1 className="month-name-text">{MONTHS[viewMonth]}</h1>
              <span className="month-year-text">{viewYear}</span>
            </div>

            <div className="header-actions-right">
              <button className="glass-icon-btn nav-arrow" onClick={nextMonth}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              
              <div className="action-divider" />
              
              <button 
                className={`glass-icon-btn layout-toggle-btn ${isJournalOpen ? 'is-active' : ''}`} 
                onClick={() => setIsJournalOpen(!isJournalOpen)}
                title={isJournalOpen ? "Hide Journal" : "Show Journal"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              </button>
            </div>
          </header>

          <div className="calendar-grid-container">
            <CalendarGrid
              year={viewYear} month={viewMonth} today={today}
              startDate={startDate} endDate={endDate} hoverDate={hoverDate}
              onDayClick={handleDayClick} onDayHover={setHoverDate} onDayLeave={() => setHoverDate(null)}
            />
          </div>
        </section>

        {/* ── MOBILE BACKDROP FOR DRAWER ── */}
        <div 
          className={`mobile-drawer-backdrop ${isJournalOpen ? 'is-open' : ''}`}
          onClick={() => setIsJournalOpen(false)}
          aria-hidden="true"
        />

        {/* ── 3. JOURNAL PANEL (Desktop Column OR Mobile Drawer) ── */}
        <aside className={`binder-page journal-panel ${isJournalOpen ? 'is-open' : 'is-closed'}`}>
          <div className="journal-content-lock">
             <NotesPanel startDate={startDate} endDate={endDate} onClear={clearSelection} />
          </div>
        </aside>

      </main>
    </div>
  )
}