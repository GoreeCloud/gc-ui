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
  const blockAndAnnounce = (event, element) => {
    // Capture occurs before the form's ordinary submit handlers. This is UX
    // feedback, not a replacement for server-side authorization.
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
  };
  const onClick = event => {
    // Composed paths expose the actual control inside an open shadow root;
    // event.target alone can be retargeted to its host.
    const path = typeof event.composedPath === 'function' ? event.composedPath() : null;
    const nodes = Array.isArray(path) && path.includes(root)
      ? path.slice(0, path.indexOf(root) + 1)
      : null;
    let element = event.target;
    let index = 0;
    while (element) {
      if (typeof element.getAttribute === 'function') {
        const state = element.getAttribute('data-gc-availability');
        const tag = element.tagName?.toUpperCase();
        const eligible = tag === 'BUTTON' || tag === 'A' ||
          (tag === 'INPUT' && ['button', 'submit', 'reset'].includes(element.type));
        if (AVAILABLE_STATES.has(state) && eligible) {
          blockAndAnnounce(event, element);
          return;
        }
      }
      if (element === root) break;
      element = nodes ? nodes[++index] : (element.parentNode || element.host || null);
    }
  };
  // Implicit Enter submissions and form.requestSubmit() can bypass click
  // interception. Handle intentionally planned forms and marked submitters.
  const onSubmit = event => {
    const form = event.target;
    if (form?.tagName?.toUpperCase() !== 'FORM') return;
    const submitter = event.submitter;
    const planned = [submitter, form].find(element =>
      element && typeof element.getAttribute === 'function' &&
      AVAILABLE_STATES.has(element.getAttribute('data-gc-availability')));
    if (planned) blockAndAnnounce(event, planned);
  };
  root.addEventListener('click', onClick, true);
  root.addEventListener('submit', onSubmit, true);
  return () => {
    root.removeEventListener('click', onClick, true);
    root.removeEventListener('submit', onSubmit, true);
  };
}
