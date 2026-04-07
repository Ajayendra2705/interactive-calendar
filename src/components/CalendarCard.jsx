import { useState, useCallback } from 'react'
import CalendarGrid from './CalendarGrid'
import NotesPanel from './NotesPanel'
import './CalendarCard.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function CalendarCard() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)

  const prevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11 }
      return m - 1
    })
    setStartDate(null); setEndDate(null); setHoverDate(null)
  }, [])

  const nextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0 }
      return m + 1
    })
    setStartDate(null); setEndDate(null); setHoverDate(null)
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
    <div className="calendar-card">
      <div className="calendar-hero">
        <img src="/hero.png" alt="Calendar landscape" className="hero-img" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="spiral-holes">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="spiral-hole" />
            ))}
          </div>
          <div className="month-nav">
            <button className="nav-btn" onClick={prevMonth} aria-label="Previous month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="month-title">
              <span className="month-name">{MONTHS[viewMonth]}</span>
              <span className="month-year">{viewYear}</span>
            </div>
            <button className="nav-btn" onClick={nextMonth} aria-label="Next month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="calendar-body">
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
        <NotesPanel
          startDate={startDate}
          endDate={endDate}
          onClear={clearSelection}
        />
      </div>
    </div>
  )
}
