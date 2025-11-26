/* FILE: app/admin/page.jsx */
'use client'

import { useState, useEffect } from 'react'
import { sanitizeIframe } from '@/lib/sanitizeIframe'

const STORAGE_KEY = 'tmdb_iframes_v1'

export default function AdminPage() {
  const [tmdbId, setTmdbId] = useState('')
  const [iframeHtml, setIframeHtml] = useState('')
  const [preview, setPreview] = useState('')
  const [entries, setEntries] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [editingId, setEditingId] = useState(null)

  // Load entries from localStorage on mount
  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEntries(JSON.parse(stored))
      }
    } catch (error) {
      showMessage('error', 'Failed to load entries from storage')
    }
  }

  const saveEntries = (newEntries) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries))
      setEntries(newEntries)
    } catch (error) {
      showMessage('error', 'Failed to save to storage')
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handlePreview = () => {
    const sanitized = sanitizeIframe(iframeHtml)
    if (sanitized) {
      setPreview(sanitized)
      showMessage('success', 'Preview updated - iframe is valid')
    } else {
      setPreview('')
      showMessage('error', 'Invalid iframe HTML - check your input')
    }
  }

  const handleSave = () => {
    if (!tmdbId.trim()) {
      showMessage('error', 'Please enter a TMDB ID')
      return
    }

    const sanitized = sanitizeIframe(iframeHtml)
    
    if (!sanitized) {
      showMessage('error', 'Invalid iframe HTML. Only a single <iframe> tag with safe attributes is allowed.')
      return
    }

    const newEntries = {
      ...entries,
      [tmdbId.trim()]: sanitized
    }

    saveEntries(newEntries)
    showMessage('success', `Saved TMDB ID: ${tmdbId}`)
    
    // Clear editor
    setTmdbId('')
    setIframeHtml('')
    setPreview('')
    setEditingId(null)
  }

  const handleEdit = (id) => {
    setTmdbId(id)
    setIframeHtml(entries[id])
    setPreview(entries[id])
    setEditingId(id)
    showMessage('warning', `Editing TMDB ID: ${id}`)
  }

  const handleDelete = (id) => {
    if (confirm(`Delete entry for TMDB ID: ${id}?`)) {
      const newEntries = { ...entries }
      delete newEntries[id]
      saveEntries(newEntries)
      showMessage('success', `Deleted TMDB ID: ${id}`)
      
      if (editingId === id) {
        setTmdbId('')
        setIframeHtml('')
        setPreview('')
        setEditingId(null)
      }
    }
  }

  const handleClear = () => {
    setTmdbId('')
    setIframeHtml('')
    setPreview('')
    setEditingId(null)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tmdb-iframes-backup-${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    showMessage('success', 'Backup exported successfully')
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result)
        
        // Merge with existing entries (imported takes precedence)
        const merged = { ...entries, ...imported }
        saveEntries(merged)
        
        showMessage('success', `Imported ${Object.keys(imported).length} entries`)
      } catch (error) {
        showMessage('error', 'Invalid JSON file')
      }
    }
    
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const handleCopyUrl = (id) => {
    const url = `${window.location.origin}/movie/${id}`
    navigator.clipboard.writeText(url).then(() => {
      showMessage('success', 'URL copied to clipboard!')
    })
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="alert alert-warning">
        <strong>⚠️ Legal Notice:</strong> Do not upload or embed copyrighted streams you are not authorized to use.
      </div>

      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Admin Panel</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card admin-editor">
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          {editingId ? `Editing TMDB ID: ${editingId}` : 'Add New Entry'}
        </h2>

        <div className="form-group">
          <label className="label">TMDB ID</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., 66732"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">Iframe HTML</label>
          <textarea
            className="textarea"
            placeholder='Paste your iframe embed code here, e.g., <iframe src="https://example.com/embed/..." width="100%" height="100%" frameborder="0" allowfullscreen></iframe>'
            value={iframeHtml}
            onChange={(e) => setIframeHtml(e.target.value)}
            rows={6}
          />
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSave}>
            💾 {editingId ? 'Update' : 'Save'}
          </button>
          <button className="btn btn-secondary" onClick={handlePreview}>
            👁️ Preview
          </button>
          <button className="btn btn-secondary" onClick={handleClear}>
            🗑️ Clear Editor
          </button>
        </div>

        <div className="form-group" style={{ marginTop: '24px' }}>
          <label className="label">Preview</label>
          <div className="preview-container">
            <div className="preview-overlay">Preview Safety: Sanitized HTML</div>
            {preview ? (
              <div dangerouslySetInnerHTML={{ __html: preview }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <div className="preview-empty">No preview - paste iframe HTML above and click Preview</div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px' }}>Saved Entries ({Object.keys(entries).length})</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-small" onClick={handleExport}>
              📥 Export JSON
            </button>
            <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer', margin: 0 }}>
              📤 Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {Object.keys(entries).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No entries yet. Add your first iframe above!
          </div>
        ) : (
          <div className="entries-list">
            {Object.entries(entries).map(([id, html]) => (
              <div key={id} className="entry-item">
                <div className="entry-info">
                  <div className="entry-id">TMDB ID: {id}</div>
                  <div className="entry-preview">{html.substring(0, 100)}...</div>
                </div>
                <div className="entry-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleCopyUrl(id)}
                    title="Copy public URL"
                  >
                    🔗 Copy URL
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => window.open(`/movie/${id}`, '_blank')}
                    title="Open public page"
                  >
                    🎬 Open
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleEdit(id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
