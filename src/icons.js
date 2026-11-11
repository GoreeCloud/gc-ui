/** Original uniform 24x24 line glyphs; no third-party glyph assets. */
const GLYPHS = Object.freeze({
  home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  arrowLeft: '<path d="m12 5-7 7 7 7M5 12h15"/>',
  arrowRight: '<path d="M12 5l7 7-7 7M4 12h15"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  minus: '<path d="M4 12h16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  alert: '<path d="M12 3 2 21h20L12 3zM12 9v5M12 18h.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  settings: '<path d="M10 3h4l1 2.5 2.5.9L20 5l2 3.5-2 1.9v3.2l2 1.9-2 3.5-2.5-1.4-2.5.9L14 21h-4l-1-2.5-2.5-.9L4 19l-2-3.5 2-1.9v-3.2L2 8.5 4 5l2.5 1.4 2.5-.9z"/><circle cx="12" cy="12" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  moon: '<path d="M20.5 14.1A8.7 8.7 0 0 1 9.9 3.5 8.7 8.7 0 1 0 20.5 14.1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.5-4.5 3-7 8-7s7.5 2.5 8 7"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2 20c0-4 2.5-6 7-6s7 2 7 6M17 5a3 3 0 0 1 0 6M18 14c2.5.3 4 2.3 4 5"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M6 2h8l5 5v15H6zM14 2v5h5M9 12h7M9 16h7"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',
  upload: '<path d="M12 17V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  share: '<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
  edit: '<path d="m4 16-1 5 5-1L20 8l-4-4L4 16zM13 7l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7M10 11v6M14 11v6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.3 8.5 8 11 4.7-2.5 8-6 8-11V5z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  cloud: '<path d="M6 19a5 5 0 0 1-1-9.9A7.5 7.5 0 0 1 19.5 11 4 4 0 0 1 19 19z"/>',
  sync: '<path d="M20 7v5h-5M4 17v-5h5M5 9a8 8 0 0 1 13-3l2 1M4 17l2 1a8 8 0 0 0 13-3"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="m3 3 18 18M9.9 5.3A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3 3.8M6 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 0 1 5.2 0c0 2-2.7 2.3-2.7 4.5M12 17h.01"/>',
  external: '<path d="M13 4h7v7M20 4l-9 9M20 14v6H4V4h6"/>',
  sparkle: '<path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z"/>'
});
export const ICON_NAMES = Object.freeze(Object.keys(GLYPHS));
export function hasIcon(name) { return Object.hasOwn(GLYPHS, name); }
export function iconSvg(name, { size = 24, decorative = true } = {}) {
  if (!hasIcon(name)) throw new RangeError("Unknown GoreeCloud icon");
  if (!Number.isFinite(size) || size < 8 || size > 256) throw new RangeError("Icon size must be 8–256");
  const aria = decorative ? ' aria-hidden="true"' : ' role="img"';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + aria + '>' + GLYPHS[name] + '</svg>';
}
