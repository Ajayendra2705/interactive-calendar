import { useMemo, useState } from 'react'
import './CalendarGrid.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// A custom mapping of holidays for visual creative flair
const HOLIDAYS = {
  '1-1': 'New Year\'s Day 🎆',
  '2-14': 'Valentine\'s Day 💖',
  '3-17': 'St. Patrick\'s Day ☘️',
  '7-4': 'Independence Day 🇺🇸',
  '10-31': 'Halloween 🎃',
  '12-25': 'Christmas 🎄',
  '12-31': 'New Year\'s Eve 🥂'
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isInRange(date, start, end) {
  if (!start || !end) return false
  return date > start && date < end
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
  const [flippingDirection, setFlippingDirection] = useState(null)

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()
    const result = []

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: prevDays - i, current: false, date: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, current: true, date: new Date(year, month, d) })
    }
    const trailing = 42 - result.length
    for (let d = 1; d <= trailing; d++) {
      result.push({ day: d, current: false, date: null })
    }
    return result
  }, [year, month])

  return (
    <div className="calendar-grid-wrapper fluid">
      <div className="day-headers fluid-headers" role="row">
        {DAYS.map((d, i) => (
          <div key={d} className={`day-header fluid-header${i === 0 ? ' sunday' : i === 6 ? ' saturday' : ''}`} role="columnheader">{d}</div>
        ))}
      </div>
      <div className="day-grid fluid-grid" role="grid">
        {cells.map((cell, idx) => {
          if (!cell.current) {
            return <div key={idx} className="day-cell fluid-cell ghost"><span>{cell.day}</span></div>
          }

          const d = cell.date
          const dow = d.getDay()
          const isToday = isSameDay(d, today)
          const isStart = isSameDay(d, startDate)
          const isEnd = isSameDay(d, endDate)
          const inRange = endDate ? isInRange(d, startDate, endDate) : isInHoverRange(d, startDate, hoverDate)
          const isHovered = isSameDay(d, hoverDate)
          
          let holidayText = HOLIDAYS[`${month + 1}-${cell.day}`]

          let cls = 'day-cell fluid-cell'
          if (!endDate && isStart && hoverDate && hoverDate < startDate) {
            cls += ' selected-end'
          } else if (!endDate && isHovered && startDate && hoverDate < startDate) {
            cls += ' selected-start'
          } else if (isStart) cls += ' selected-start'
          else if (isEnd) cls += ' selected-end'

          if (inRange) cls += ' in-range'
          if (isToday) cls += ' today'
          if (dow === 0) cls += ' sunday'
          if (dow === 6) cls += ' saturday'

          return (
            <div
              key={idx}
              className={cls}
              role="gridcell"
              onClick={() => onDayClick(d)}
              onMouseEnter={() => onDayHover(d)}
              onMouseLeave={onDayLeave}
            >
              <div className="day-cell-content">
                <span className="day-number fluid-number">{cell.day}</span>
                {holidayText && <span className="holiday-indicator" title={holidayText}>✦</span>}
                {holidayText && <div className="holiday-tooltip">{holidayText}</div>}
              </div>
              {isToday && <span className="today-dot fluid-dot" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
