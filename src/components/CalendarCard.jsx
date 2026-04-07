import { useState, useCallback, useEffect } from 'react'
import CalendarGrid from './CalendarGrid'
import NotesPanel from './NotesPanel'
import './CalendarCard.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
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
  
  // Theme state
  const [themeIndex, setThemeIndex] = useState(0)
  const themes = ['theme-default', 'theme-sunset', 'theme-aurora']

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
      setStartDate(date)
      setEndDate(null)
    } else {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
    }
  }, [startDate, endDate])

  const clearSelection = useCallback(() => {
    setStartDate(null); setEndDate(null); setHoverDate(null)
  }, [])

  return (
    <div className={`app-container ${themes[themeIndex]}`}>
      {/* Cinematic Background Blur */}
      <div className="ambient-background">
        <img src="/hero.png" aria-hidden="true" />
      </div>

      <div className="full-calendar-binder">
        {/* LEFT PAGE: Hero Image & Clock */}
        <div className="binder-page left-page">
          <img src="/hero.png" alt="Artwork" className="full-hero-img" />
          <div className="hero-vignette" />
          
          <div className="glass-clock-widget">
            <h2 className="clock-time">
              {today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <p className="clock-date">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="theme-switcher">
            <button 
              className="theme-btn" 
              onClick={() => setThemeIndex((prev) => (prev + 1) % themes.length)}
              title="Change Theme"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
            </button>
          </div>
        </div>

        {/* MIDDLE BINDER RING */}
          <div className="center-spiral">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="hardware-ring">
                <div className="hole dark-hole" />
                <div className="metal-coil" />
                <div className="hole light-hole" />
              </div>
            ))}
          </div>

        {/* RIGHT PAGE: Calendar & Nav */}
        <div className="binder-page right-page">
          <div className="month-nav-header">
            <button className="nav-btn massive-nav" onClick={prevMonth} aria-label="Previous month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="month-title-huge">
              <span className="month-huge-name">{MONTHS[viewMonth]}</span>
              <span className="month-huge-year">{viewYear}</span>
            </div>
            <button className="nav-btn massive-nav" onClick={nextMonth} aria-label="Next month">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="calendar-interactive-area">
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              today={today}
              startDate={startDate}
              endDate={endDate}
              hoverDate={hoverDate}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
              onDayLeave={() => setHoverDate(null)}
            />
          </div>

          <div className="notes-dock">
             <NotesPanel
              startDate={startDate}
              endDate={endDate}
              onClear={clearSelection}
             />
          </div>
        </div>
      </div>
    </div>
  )
}
