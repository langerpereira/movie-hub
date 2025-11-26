/* FILE: __tests__/sanitizeIframe.test.js */
/**
 * @jest-environment jsdom
 */

import { sanitizeIframe } from '../lib/sanitizeIframe'

describe('sanitizeIframe', () => {
  test('accepts valid iframe with https src', () => {
    const input = '<iframe src="https://example.com/player" width="640" height="360"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    expect(result).toContain('src="https://example.com/player"')
    expect(result).toContain('<iframe')
    expect(result).toContain('</iframe>')
  })

  test('rejects iframe with javascript: src', () => {
    const input = '<iframe src="javascript:alert(\'xss\')" width="640" height="360"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull()
  })

  test('rejects non-iframe content', () => {
    const input = '<div>Not an iframe</div>'
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull()
  })

  test('rejects script tags', () => {
    const input = '<script>alert("xss")</script><iframe src="https://example.com"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull() // More than one element
  })

  test('strips disallowed attributes (e.g., onload, onclick)', () => {
    const input = '<iframe src="https://example.com/player" onload="alert(\'xss\')" onclick="alert(\'xss\')" width="640"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    expect(result).not.toContain('onload')
    expect(result).not.toContain('onclick')
    expect(result).toContain('src="https://example.com/player"')
  })

  test('keeps allowed attributes and preserves quoted values', () => {
    const input = '<iframe src="https://example.com/embed" width="100%" height="500" frameborder="0" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    expect(result).toContain('src="https://example.com/embed"')
    expect(result).toContain('width="100%"')
    expect(result).toContain('height="500"')
    expect(result).toContain('frameborder="0"')
    expect(result).toContain('allow="autoplay; fullscreen"')
    expect(result).toContain('allowfullscreen')
    expect(result).toContain('referrerpolicy="no-referrer"')
  })

  test('limits attribute value lengths', () => {
    const longSrc = 'https://example.com/' + 'a'.repeat(3000)
    const input = `<iframe src="${longSrc}" width="640"></iframe>`
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull() // Should reject due to length limit
  })

  test('rejects empty or null input', () => {
    expect(sanitizeIframe('')).toBeNull()
    expect(sanitizeIframe(null)).toBeNull()
    expect(sanitizeIframe(undefined)).toBeNull()
  })

  test('rejects iframe without src attribute', () => {
    const input = '<iframe width="640" height="360"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull()
  })

  test('accepts http src (not just https)', () => {
    const input = '<iframe src="http://example.com/player" width="640"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    expect(result).toContain('src="http://example.com/player"')
  })

  test('rejects file:// protocol', () => {
    const input = '<iframe src="file:///etc/passwd" width="640"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull()
  })

  test('allows data: URIs', () => {
    const input = '<iframe src="data:text/html,<h1>Test</h1>" width="640"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    expect(result).toContain('src="data:text/html,<h1>Test</h1>"')
  })

  test('strips style attributes with javascript:', () => {
    const input = '<iframe src="https://example.com" style="background:url(javascript:alert(1))" width="640"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    // Style with javascript: should be stripped
    expect(result).not.toContain('javascript:')
  })

  test('rejects multiple iframes', () => {
    const input = '<iframe src="https://example.com/1"></iframe><iframe src="https://example.com/2"></iframe>'
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull() // Only one iframe allowed
  })

  test('handles whitespace and newlines', () => {
    const input = `
      <iframe 
        src="https://example.com/player" 
        width="640" 
        height="360"
        allowfullscreen>
      </iframe>
    `
    const result = sanitizeIframe(input)
    
    expect(result).not.toBeNull()
    expect(result).toContain('src="https://example.com/player"')
  })

  test('rejects extremely long input (DoS protection)', () => {
    const input = '<iframe src="https://example.com"></iframe>' + 'x'.repeat(20000)
    const result = sanitizeIframe(input)
    
    expect(result).toBeNull()
  })
})
