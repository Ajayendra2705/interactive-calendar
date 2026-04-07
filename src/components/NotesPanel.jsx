import { useState, useEffect, useCallback } from 'react'
import './NotesPanel.css'

const STORAGE_KEY = 'calendar-notes'

function fmt(date) {
  if (!date) return null
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function fmtDisplay(date) {
  if (!date) return null
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export default function NotesPanel({ startDate, endDate, onClear }) {
  const [notes, setNotes] = useState(loadNotes)
  const [input, setInput] = useState('')

  const rangeKey = startDate ? `${fmt(startDate)}__${fmt(endDate || startDate)}` : null
  const currentNote = rangeKey ? (notes[rangeKey] || '') : ''

  useEffect(() => {
    setInput(currentNote)
  }, [rangeKey, currentNote])

  const handleSave = useCallback(() => {
    if (!rangeKey) return
    const updated = { ...notes }
    if (input.trim()) { updated[rangeKey] = input.trim() } else { delete updated[rangeKey] }
    setNotes(updated); saveNotes(updated)
  }, [rangeKey, notes, input])

  const handleDelete = useCallback((key) => {
    const updated = { ...notes }
    delete updated[key]
    setNotes(updated); saveNotes(updated)
  }, [notes])

  const allNoteEntries = Object.entries(notes)
  const rangeLabel = startDate ? (endDate && !isSameDay(startDate, endDate) ? `${fmtDisplay(startDate)} → ${fmtDisplay(endDate)}` : fmtDisplay(startDate)) : null

  return (
    <div className="notes-dock">
      <div className="notes-header-fluid">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <span>JOURNAL</span>
      </div>

      <div className="docked-content">
        {startDate ? (
          <div className="note-input-fluid">
            <div className="note-range-label" style={{ marginBottom: '12px' }}>
              <span className="range-tag">{rangeLabel}</span>
              <button className="clear-btn" onClick={onClear} title="Clear selection">✕</button>
            </div>
            <textarea
              className="fluid-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Write something about ${rangeLabel}...`}
            />
            <button 
              className="save-btn" 
              onClick={handleSave} 
              disabled={input.trim() === currentNote}
              style={{ marginTop: '12px', width: 'fit-content', padding: '12px 24px' }}
            >
              {input.trim() === currentNote && currentNote ? 'Saved ✓' : 'Save Entry'}
            </button>
          </div>
        ) : (
          <div className="note-prompt-fluid">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <p>Select a date or range to log a note</p>
          </div>
        )}

        <div className="saved-notes-fluid">
          {allNoteEntries.length > 0 ? (
            allNoteEntries.map(([key, text]) => {
              const [s, e] = key.split('__')
              const label = s === e ? s : `${s} → ${e}`
              return (
                <div key={key} className="saved-fluid-item">
                  <div className="saved-note-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="saved-note-range">{label}</span>
                    <button className="delete-note-btn" onClick={() => handleDelete(key)} style={{ color: 'var(--text-muted)' }}>✕</button>
                  </div>
                  <p className="saved-note-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{text}</p>
                </div>
              )
            })
          ) : (
            <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '20px', fontSize: '0.8rem' }}>No entries yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
