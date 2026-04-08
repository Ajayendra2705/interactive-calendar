import { useMemo } from 'react'
import './CalendarGrid.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Fun, premium-looking emojis for holidays
const HOLIDAYS = {
  '1-1': 'New Year 🎇',
  '2-14': 'Valentine\'s 💌',
  '3-17': 'St. Patrick\'s 🍀',
  '7-4': 'Independence 🎆',
  '10-31': 'Halloween 👻',
  '12-25': 'Christmas 🎄',
  '12-31': 'NYE 🥂'
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && 
         a.getMonth() === b.getMonth() && 
         a.getDate() === b.getDate()
}

function isInRange(date, start, end) {
  if (!start || !end) return false
  const lo = start < end ? start : end
  const hi = start < end ? end : start
  return date > lo && date < hi
}

function isInHoverRange(date, start, hover) {
  if (!start || !hover) return false
  const lo = start < hover ? start : hover
  const hi = start < hover ? hover : start
  return date > lo && date < hi
}

export default function CalendarGrid({
  year, month, today,
  startDate, endDate, hoverDate,
  onDayClick, onDayHover, onDayLeave
}) {
  
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()
    const result = []

    // Previous month ghost days
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: prevDays - i, current: false, date: null })
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, current: true, date: new Date(year, month, d) })
    }
    // Next month ghost days (fill out exactly 6 rows = 42 cells)
    const trailing = 42 - result.length
    for (let d = 1; d <= trailing; d++) {
      result.push({ day: d, current: false, date: null })
    }
    return result
  }, [year, month])

  return (
    <div className="premium-grid-wrapper">
      
      {/* ── DAYS OF THE WEEK HEADER ── */}
      <div className="grid-headers">
        {DAYS.map((d, i) => (
          <div key={d} className={`header-cell ${i === 0 || i === 6 ? 'weekend' : ''}`}>
            {d}
          </div>
        ))}
      </div>
      
      {/* ── THE INTERACTIVE CALENDAR ── */}
      <div className="grid-cells" onMouseLeave={onDayLeave}>
        {cells.map((cell, idx) => {
          if (!cell.current) {
            return (
              <div key={idx} className="day-cell ghost-cell">
                <span className="day-text">{cell.day}</span>
              </div>
            )
          }

          const d = cell.date
          const isWeekend = d.getDay() === 0 || d.getDay() === 6
          const isToday = isSameDay(d, today)
          
          // Selection Logic
          const isStart = isSameDay(d, startDate)
          const isEnd = isSameDay(d, endDate)
          const isHovered = isSameDay(d, hoverDate)
          
          // Determine if cell is actively in a selected or hovered range
          const inConfirmedRange = endDate && isInRange(d, startDate, endDate)
          const inActiveHoverRange = !endDate && startDate && hoverDate && isInHoverRange(d, startDate, hoverDate)
          const inRange = inConfirmedRange || inActiveHoverRange

          // Determine exact boundaries for the "Ribbon" CSS effect
          let isRibbonStart = false
          let isRibbonEnd = false

          if (startDate && endDate) {
            isRibbonStart = isSameDay(d, startDate < endDate ? startDate : endDate)
            isRibbonEnd = isSameDay(d, startDate > endDate ? startDate : endDate)
          } else if (startDate && hoverDate) {
            isRibbonStart = isSameDay(d, startDate < hoverDate ? startDate : hoverDate)
            isRibbonEnd = isSameDay(d, startDate > hoverDate ? startDate : hoverDate)
          } else if (isStart && !endDate) {
            isRibbonStart = true
            isRibbonEnd = true
          }

          let holidayText = HOLIDAYS[`${month + 1}-${cell.day}`]

          // Build class list dynamically
          let cls = 'day-cell active-cell'
          if (isWeekend) cls += ' weekend'
          if (isToday) cls += ' is-today'
          if (inRange) cls += ' in-range'
          if (isRibbonStart) cls += ' ribbon-start'
          if (isRibbonEnd) cls += ' ribbon-end'

          return (
            <div
              key={idx}
              className={cls}
              onClick={() => onDayClick(d)}
              onMouseEnter={() => onDayHover(d)}
              onMouseMove={(e) => {
                // Captures mouse position for the cinematic spotlight glow
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                e.currentTarget.style.setProperty('--mouse-x', `${x}px`)
                e.currentTarget.style.setProperty('--mouse-y', `${y}px`)
              }}
            >
              {/* This background element creates the connected ribbon effect */}
              <div className="range-connector-bg" />

              <div className="cell-content-layer">
                <span className="day-text">{cell.day}</span>
                
                {holidayText && (
                  <>
                    <span className="holiday-sparkle">✦</span>
                    <div className="glass-tooltip">{holidayText}</div>
                  </>
                )}
              </div>
              
              {isToday && <span className="today-pulse-dot" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}