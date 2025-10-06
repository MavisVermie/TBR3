/**
 * Simple HTML sanitization utility to prevent XSS attacks
 * This removes potentially dangerous HTML tags and attributes
 */

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'span', 'div'];
const ALLOWED_ATTRIBUTES = ['class', 'style'];

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML content
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Recursively clean the DOM tree
  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      
      // If tag is not allowed, return only the text content
      if (!ALLOWED_TAGS.includes(tagName)) {
        return node.textContent || '';
      }

      // Create a new clean element
      const cleanElement = document.createElement(tagName);
      
      // Copy allowed attributes
      for (const attr of node.attributes) {
        if (ALLOWED_ATTRIBUTES.includes(attr.name.toLowerCase())) {
          // Additional check for style attribute to prevent dangerous CSS
          if (attr.name === 'style') {
            const safeStyle = sanitizeStyle(attr.value);
            if (safeStyle) {
              cleanElement.setAttribute(attr.name, safeStyle);
            }
          } else {
            cleanElement.setAttribute(attr.name, attr.value);
          }
        }
      }

      // Recursively clean child nodes
      for (const child of node.childNodes) {
        const cleanedChild = cleanNode(child);
        if (typeof cleanedChild === 'string') {
          cleanElement.appendChild(document.createTextNode(cleanedChild));
        } else if (cleanedChild) {
          cleanElement.appendChild(cleanedChild);
        }
      }

      return cleanElement;
    }

    return null;
  }

  // Clean all child nodes
  const cleanDiv = document.createElement('div');
  for (const child of tempDiv.childNodes) {
    const cleanedChild = cleanNode(child);
    if (typeof cleanedChild === 'string') {
      cleanDiv.appendChild(document.createTextNode(cleanedChild));
    } else if (cleanedChild) {
      cleanDiv.appendChild(cleanedChild);
    }
  }

  return cleanDiv.innerHTML;
}

/**
 * Sanitizes CSS style attribute to prevent dangerous CSS
 * @param {string} style - The style attribute value
 * @returns {string} - The sanitized style value
 */
function sanitizeStyle(style) {
  if (!style) return '';

  // Remove potentially dangerous CSS properties
  const dangerousProps = [
    'javascript:',
    'expression(',
    'behavior:',
    'binding:',
    '-moz-binding',
    'import',
    '@import',
    'url(',
    'position:',
    'z-index:'
  ];

  let cleanStyle = style;
  for (const prop of dangerousProps) {
    cleanStyle = cleanStyle.replace(new RegExp(prop, 'gi'), '');
  }

  return cleanStyle;
}

/**
 * Escapes HTML entities to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}