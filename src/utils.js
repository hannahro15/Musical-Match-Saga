// utils.js - General utility functions

/**
 * Formats a score with thousands separators, using a fixed locale so it looks
 * the same for every player.
 * @param {number} n
 * @returns {string}
 */
export function formatScore(n) {
  return n.toLocaleString('en-GB');
}

/**
 * Formats a count of seconds as minutes and seconds, e.g. 90 -> "1:30" and
 * 5 -> "0:05". Negative or non-numeric input is treated as zero.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function showElement(element) {
  if (element) {
    element.classList.remove('hidden');
  }
}


export function hideElement(element) {
  if (element) {
    element.classList.add('hidden');
  }
}

/**
 * Announces a message to screen-reader users via the hidden #sr-announcer
 * live region. Clears the region first so repeated identical messages are
 * still announced (aria-live only fires on content change).
 * @param {string} message
 */
export function announce(message) {
  const announcer = document.getElementById('sr-announcer');
  if (!announcer || !message) return;
  announcer.textContent = '';
  // Force a reflow/microtask so identical consecutive messages re-announce.
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 50);
}
