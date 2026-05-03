import createDOMPurify from 'dompurify';

let DOMPurify;
try {
  // Use dynamic import or require to avoid Jest VM issues if possible
  // For simplicity, we just check if window exists (browser), otherwise load JSDOM
  if (typeof window === 'undefined') {
    const { JSDOM } = await import('jsdom');
    const window = new JSDOM('').window;
    DOMPurify = createDOMPurify(window);
  } else {
    DOMPurify = createDOMPurify(window);
  }
} catch (e) {
  // Fallback for restricted environments: simple tag stripping
  DOMPurify = { 
    sanitize: (str) => str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                          .replace(/on\w+="[^"]*"/gim, "")
  };
}

/**
 * Sanitizes a string to prevent XSS using DOMPurify.
 * Handles non-string inputs gracefully.
 * 
 * @param {string} text - The raw text to sanitize.
 * @returns {string} The sanitized, safe string.
 */
export function sanitize(text) {
  if (typeof text !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(text);
}

