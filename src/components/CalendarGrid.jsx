import { useMemo } from 'react'
import './CalendarGrid.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

  const activeEnd = endDate || hoverDate

  return (
    <div className="calendar-grid-wrapper">
      <div className="day-headers" role="row">
        {DAYS.map((d, i) => (
          <div key={d} className={`day-header${i === 0 ? ' sunday' : i === 6 ? ' saturday' : ''}`} role="columnheader">{d}</div>
        ))}
      </div>
      <div className="day-grid" role="grid" aria-label="Calendar">
        {cells.map((cell, idx) => {
          if (!cell.current) {
            return <div key={idx} className="day-cell ghost" aria-hidden="true"><span>{cell.day}</span></div>
          }

          const d = cell.date
          const dow = d.getDay()
          const isToday = isSameDay(d, today)
          const isStart = isSameDay(d, startDate)
          const isEnd = isSameDay(d, endDate)
          const inRange = endDate ? isInRange(d, startDate, endDate) : isInHoverRange(d, startDate, hoverDate)
          const isHovered = isSameDay(d, hoverDate)

          let cls = 'day-cell'
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
              id={`day-${year}-${month + 1}-${cell.day}`}
              className={cls}
              role="gridcell"
              aria-label={d.toDateString()}
              aria-selected={isStart || isEnd}
              onClick={() => onDayClick(d)}
              onMouseEnter={() => onDayHover(d)}
              onMouseLeave={onDayLeave}
            >
              <span className="day-number">{cell.day}</span>
              {isToday && <span className="today-dot" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
