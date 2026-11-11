import { toast } from './elements.js';

const AVAILABLE_STATES = new Set(['planned', 'unavailable']);

/**
 * Progressive enhancement for visible, not-yet-implemented native actions.
 * Mark intentionally nonfunctional actions with data-gc-availability="planned"
 * and optionally data-gc-feature="Feature name". This is not a permission gate.
 * Never attach a real side-effectful handler to a planned action.
 */
export function initAvailabilityFeedback(root, { region, notify } = {}) {
  if (!root || typeof root.addEventListener !== 'function' ||
      typeof root.removeEventListener !== 'function') {
    throw new TypeError('Availability feedback requires an event root');
  }
  if (notify !== undefined && typeof notify !== 'function') {
    throw new TypeError('Availability notifier must be a function');
  }
  const announce = notify || (message => toast(message, { region, kind: 'info' }));
  let lastMessage = '';
  let lastTime = -Infinity;
  const onClick = event => {
    let element = event.target;
    while (element && element !== root) {
      if (typeof element.getAttribute === 'function') {
        const state = element.getAttribute('data-gc-availability');
        const tag = element.tagName?.toUpperCase();
        const eligible = tag === 'BUTTON' || tag === 'A' ||
          (tag === 'INPUT' && ['button', 'submit', 'reset'].includes(element.type));
        if (AVAILABLE_STATES.has(state) && eligible) {
          // A capturing listener blocks descendant click handlers and defaults.
          event.preventDefault();
          event.stopImmediatePropagation();
          const feature = (element.getAttribute('data-gc-feature') || '').trim().slice(0, 80);
          const message = feature ? feature + ' is not available yet.' : 'Not available yet.';
          const now = Date.now();
          if (message !== lastMessage || now - lastTime >= 1200) {
            lastMessage = message;
            lastTime = now;
            announce(message);
          }
          return;
        }
      }
      element = element.parentNode || element.host || null;
    }
  };
  root.addEventListener('click', onClick, true);
  return () => root.removeEventListener('click', onClick, true);
}
