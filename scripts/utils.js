// Utility Functions

/**
 * Delays function execution to reduce unnecessary function executions.
 * 
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The time in milliseconds to wait before executing the function.
 * @returns {Function} A debounced version of the input function.
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Displays an error message in the error text element.
 * 
 * @param {string} errorMsg - The error message to display.
 */
export function showError(errorMsg, errorElement) {
  errorElement.style.display = "block";
  errorElement.textContent = errorMsg;
}

/**
 * Creates an HTML element with the specified tag name and attributes.
 * @param {string} tagName - The tag name of the element (e.g., 'div', 'button').
 * @param {Object} options - The configuration object for the element.
 * @param {Object} [options.attributes] - A key-value pair of attributes to set on the element.
 * @param {Array} [options.children] - An array of child elements or text to append to the element.
 * @param {Function} [options.eventListeners] - A key-value pair of event names and their corresponding listeners.
 * @returns {HTMLElement} The newly created and configured element.
 */
export function createHtmlElement(tagName, { attributes = {}, children = [], eventListeners = {} } = {}) {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  // Add children
  children.forEach((child) => {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });

  // Add event listeners
  Object.entries(eventListeners).forEach(([event, listener]) => {
    element.addEventListener(event, listener);
  });

  return element;
}