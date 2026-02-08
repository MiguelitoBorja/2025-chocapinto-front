/**
 * Utilidades para sanitizar datos y prevenir ataques XSS
 */

/**
 * Escapa caracteres HTML peligrosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  
  const str = String(text);
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Sanitiza texto de forma más agresiva, removiendo caracteres potencialmente peligrosos
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto limpio
 */
export function sanitizeText(text) {
  if (text === null || text === undefined) return '';
  
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza URLs para prevenir javascript: y data: schemes
 * @param {string} url - URL a validar
 * @returns {string} URL segura o placeholder
 */
export function sanitizeUrl(url) {
  if (!url) return '';
  
  const str = String(url).trim().toLowerCase();
  
  // Bloquear esquemas peligrosos
  if (str.startsWith('javascript:') || 
      str.startsWith('data:') || 
      str.startsWith('vbscript:') ||
      str.startsWith('file:')) {
    return '#';
  }
  
  return url;
}

/**
 * Crea un elemento HTML de forma segura usando textContent en vez de innerHTML
 * @param {string} tag - Nombre del tag HTML
 * @param {object} attributes - Atributos del elemento
 * @param {string} text - Texto del elemento
 * @returns {HTMLElement} Elemento creado de forma segura
 */
export function createSafeElement(tag, attributes = {}, text = '') {
  const element = document.createElement(tag);
  
  // Asignar atributos de forma segura
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'src' || key === 'href') {
      element.setAttribute(key, sanitizeUrl(value));
    } else if (key.startsWith('on')) {
      // Nunca permitir event handlers inline
      console.warn(`Intento de asignar event handler inline bloqueado: ${key}`);
    } else {
      element.setAttribute(key, escapeHtml(value));
    }
  }
  
  // Usar textContent en vez de innerHTML
  if (text) {
    element.textContent = text;
  }
  
  return element;
}

/**
 * Limpia y trunca texto de forma segura
 * @param {string} text - Texto a sanitizar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto limpio y truncado
 */
export function sanitizeAndTruncate(text, maxLength = 150) {
  const clean = sanitizeText(text);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength) + '...';
}
