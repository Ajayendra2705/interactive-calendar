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
    <div className="notes-panel">
      <div className="notes-header">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <span>Notes</span>
      </div>

      {startDate ? (
        <div className="note-input-section">
          <div className="note-range-label">
            <span className="range-tag">{rangeLabel}</span>
            <button className="clear-btn" onClick={onClear} title="Clear selection">✕</button>
          </div>
          <textarea
            className="note-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Add a note for ${rangeLabel}…`}
            rows={4}
          />
          <button className="save-btn" onClick={handleSave} disabled={input.trim() === currentNote}>
            {input.trim() === currentNote && currentNote ? 'Saved ✓' : 'Save Note'}
          </button>
        </div>
      ) : (
        <div className="note-prompt">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="prompt-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>Click a date to add a note</p>
          <p className="prompt-sub">Or drag to select a range</p>
        </div>
      )}

      <div className="saved-notes-section">
        {allNoteEntries.length > 0 && (
          <>
            <div className="saved-notes-title">Saved</div>
            <div className="saved-notes-list">
              {allNoteEntries.map(([key, text]) => {
                const [s, e] = key.split('__')
                const label = s === e ? s : `${s} → ${e}`
                return (
                  <div key={key} className={`saved-note-item ${rangeKey === key ? 'active' : ''}`}>
                    <div className="saved-note-meta">
                      <span className="saved-note-range">{label}</span>
                      <button className="delete-note-btn" onClick={() => handleDelete(key)} title="Delete note">✕</button>
                    </div>
                    <p className="saved-note-text">{text}</p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
