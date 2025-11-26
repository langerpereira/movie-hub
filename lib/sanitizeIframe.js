/* FILE: lib/sanitizeIframe.js */

/**
 * Conservative iframe sanitizer
 * 
 * SECURITY RULES:
 * 1. Only allows a SINGLE <iframe> tag - rejects everything else
 * 2. Strips all dangerous attributes (on*, javascript:, etc.)
 * 3. Validates src protocol (must be https://, http://, or data:)
 * 4. Limits attribute value lengths to prevent DoS
 * 5. Removes any embedded scripts or event handlers
 * 
 * ALLOWED ATTRIBUTES:
 * - src, width, height, frameborder, allow, allowfullscreen
 * - referrerpolicy, loading, style, sandbox
 * 
 * @param {string} rawHtml - Raw HTML string potentially containing iframe
 * @returns {string|null} - Sanitized iframe HTML or null if invalid
 */
export function sanitizeIframe(rawHtml) {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return null
  }

  // Trim whitespace
  const trimmed = rawHtml.trim()

  // Check length limits (prevent DoS)
  if (trimmed.length > 10000) {
    return null
  }

  // Use DOMParser for safe parsing (client-side only)
  if (typeof window === 'undefined') {
    // Server-side: use basic regex (less safe, but works for SSR)
    return sanitizeIframeRegex(trimmed)
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(trimmed, 'text/html')

    // Find all iframe elements
    const iframes = doc.querySelectorAll('iframe')

    // Must have exactly ONE iframe
    if (iframes.length !== 1) {
      return null
    }

    const iframe = iframes[0]

    // Allowed attributes (lowercase)
    const allowedAttrs = new Set([
      'src',
      'width',
      'height',
      'frameborder',
      'allow',
      'allowfullscreen',
      'referrerpolicy',
      'loading',
      'style',
      'sandbox'
    ])

    // Build sanitized iframe
    const sanitized = document.createElement('iframe')

    // Process each attribute
    for (let attr of iframe.attributes) {
      const name = attr.name.toLowerCase()
      const value = attr.value

      // Skip disallowed attributes
      if (!allowedAttrs.has(name)) {
        continue
      }

      // Skip dangerous event handlers
      if (name.startsWith('on')) {
        continue
      }

      // Limit attribute value length
      if (value.length > 2000) {
        continue
      }

      // Special validation for src attribute
      if (name === 'src') {
        const cleanSrc = value.trim()

        // Must start with safe protocol
        if (!cleanSrc.match(/^(https?:\/\/|data:)/i)) {
          // Reject javascript:, file:, etc.
          return null
        }

        // Additional check: no javascript in src
        if (cleanSrc.toLowerCase().includes('javascript:')) {
          return null
        }

        sanitized.setAttribute('src', cleanSrc)
        continue
      }

      // For style attribute, do basic validation
      if (name === 'style') {
        // Remove any javascript: or expression() attempts
        if (value.toLowerCase().includes('javascript:') || 
            value.toLowerCase().includes('expression(')) {
          continue
        }
      }

      // Set allowed attribute
      sanitized.setAttribute(name, value)
    }

    // Must have a src attribute
    if (!sanitized.hasAttribute('src')) {
      return null
    }

    // Return sanitized iframe HTML
    return sanitized.outerHTML

  } catch (error) {
    console.error('Sanitization error:', error)
    return null
  }
}

/**
 * Regex-based fallback sanitizer (for SSR or when DOMParser unavailable)
 * Less robust but functional for basic cases
 */
function sanitizeIframeRegex(html) {
  // Extract iframe tag
  const iframeMatch = html.match(/<iframe[^>]*>/i)
  
  if (!iframeMatch) {
    return null
  }

  const iframeTag = iframeMatch[0]

  // Extract src attribute
  const srcMatch = iframeTag.match(/src=["']([^"']+)["']/i)
  
  if (!srcMatch) {
    return null
  }

  const src = srcMatch[1]

  // Validate src protocol
  if (!src.match(/^(https?:\/\/|data:)/i) || src.toLowerCase().includes('javascript:')) {
    return null
  }

  // Build minimal safe iframe
  // Extract other safe attributes
  const attrs = {
    src: src,
    width: extractAttr(iframeTag, 'width') || '100%',
    height: extractAttr(iframeTag, 'height') || '100%',
    frameborder: extractAttr(iframeTag, 'frameborder') || '0',
    allow: extractAttr(iframeTag, 'allow') || '',
    allowfullscreen: iframeTag.match(/allowfullscreen/i) ? 'allowfullscreen' : '',
    referrerpolicy: extractAttr(iframeTag, 'referrerpolicy') || '',
    loading: extractAttr(iframeTag, 'loading') || '',
    sandbox: extractAttr(iframeTag, 'sandbox') || '',
  }

  // Build clean iframe
  let clean = '<iframe'
  
  for (let [key, value] of Object.entries(attrs)) {
    if (value && value.length < 2000) {
      if (key === 'allowfullscreen' && value === 'allowfullscreen') {
        clean += ` ${key}`
      } else {
        clean += ` ${key}="${escapeHtml(value)}"`
      }
    }
  }

  clean += '></iframe>'

  return clean
}

/**
 * Extract attribute value from tag string
 */
function extractAttr(tag, attrName) {
  const match = tag.match(new RegExp(`${attrName}=["']([^"']+)["']`, 'i'))
  return match ? match[1] : null
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
