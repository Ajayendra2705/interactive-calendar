import { useState, useEffect, useCallback } from 'react'
import './NotesPanel.css'

const STORAGE_KEY = 'calendar-notes'

// Helper functions for formatting
const fmt = (date) => date ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : null
const fmtDisplay = (date) => date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export default function NotesPanel({ startDate, endDate, onClear }) {
  // Load initial state from local storage securely
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
  })
  const [input, setInput] = useState('')

  // Generate a unique key for the selected date range
  const rangeKey = startDate ? `${fmt(startDate)}__${fmt(endDate || startDate)}` : null
  const currentNote = rangeKey ? (notes[rangeKey] || '') : ''

  // Sync input when selection changes
  useEffect(() => { 
    setInput(currentNote) 
  }, [rangeKey, currentNote])

  // Save handler
  const handleSave = useCallback(() => {
    if (!rangeKey) return
    const updated = { ...notes }
    if (input.trim()) { 
      updated[rangeKey] = input.trim() 
    } else { 
      delete updated[rangeKey] 
    }
    setNotes(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [rangeKey, notes, input])

  // Delete handler
  const handleDelete = useCallback((key) => {
    const updated = { ...notes }
    delete updated[key]
    setNotes(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [notes])

  // Reverse to show newest entries at the top
  const allNoteEntries = Object.entries(notes).reverse() 
  const rangeLabel = startDate 
    ? (endDate && !isSameDay(startDate, endDate) 
        ? `${fmtDisplay(startDate)} — ${fmtDisplay(endDate)}` 
        : fmtDisplay(startDate)) 
    : null

  return (
    <div className="vertical-journal-container">
      
      {/* ── HEADER ── */}
      <header className="v-journal-header">
        <h3 className="journal-branding">JOURNAL</h3>
        <span className="entry-count-badge">
          {allNoteEntries.length} {allNoteEntries.length === 1 ? 'entry' : 'entries'}
        </span>
      </header>

      {/* ── ACTIVE INPUT EDITOR ── */}
      <section className="v-journal-input-section">
        {startDate ? (
          <div className="v-active-editor-card">
             <div className="v-card-top-bar">
               <span className="v-date-pill">{rangeLabel}</span>
               <button className="v-action-icon" onClick={onClear} title="Clear Selection">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
               </button>
             </div>
             
             <textarea 
               className="v-premium-textarea" 
               value={input} 
               onChange={e => setInput(e.target.value)} 
               placeholder="Jot down a quick memo..." 
               spellCheck="false"
             />
             
             <div className="v-editor-footer">
               <span className="v-sync-status">
                 {input.trim() === currentNote && currentNote ? 'Synced to device' : (input.trim() ? 'Unsaved changes' : '')}
               </span>
               <button 
                 className={`v-save-btn ${input.trim() === currentNote ? 'is-saved' : ''}`}
                 onClick={handleSave} 
                 disabled={input.trim() === currentNote}
               >
                 {input.trim() === currentNote && currentNote ? '✓ Saved' : 'Save Note'}
               </button>
             </div>
          </div>
        ) : (
          <div className="v-empty-editor-state">
             <div className="empty-state-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
             </div>
            <p>Select a date on the calendar<br/>to start writing.</p>
          </div>
        )}
      </section>

      <div className="v-section-divider" />

      {/* ── SCROLLABLE HISTORY TRACK ── */}
      <section className="v-history-section">
        <h4 className="history-label">Recent Memos</h4>
        
        <div className="v-history-scroll-area">
          {allNoteEntries.length > 0 ? (
            allNoteEntries.map(([key, text]) => {
               const [s, e] = key.split('__')
               const label = s === e ? s : `${s} → ${e}`
               return (
                 <div key={key} className="v-history-card">
                   <div className="v-history-top">
                     <span className="v-history-date">{label}</span>
                     <button className="v-action-icon del-btn" onClick={() => handleDelete(key)} title="Delete memo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                     </button>
                   </div>
                   <p className="v-history-text">{text}</p>
                 </div>
               )
            })
          ) : (
            <div className="v-empty-history">
              <span className="empty-history-text">No saved memos yet.</span>
            </div>
          )}
        </div>
      </section>
      
    </div>
  )
}