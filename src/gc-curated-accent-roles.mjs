/**
 * Exact curated semantic accent roles for the experimental GC UI theme runtime.
 * The source of truth for the matched alpha CSS override is
 * styles/gc.v1.product-palettes.css. These are not generated OKLCH seeds.
 * Keep this module and CSS synchronized with the contract regression test.
 */
const neutralLight=Object.freeze({
  primary:'#374151',onPrimary:'#FFFFFF',
  primaryContainer:'#E5E7EB',onPrimaryContainer:'#111827',
  secondary:'#475569',onSecondary:'#FFFFFF',
  tertiary:'#57534E',onTertiary:'#FFFFFF',
  focusRing:'#374151',selection:'#E2E8F0',onSelection:'#1F2937',
  link:'#334155',visitedLink:'#475569'
});
const neutralDark=Object.freeze({
  primary:'#D1D5DB',onPrimary:'#111827',
  primaryContainer:'#374151',onPrimaryContainer:'#F9FAFB',
  secondary:'#CBD5E1',onSecondary:'#1F2937',
  tertiary:'#D6D3D1',onTertiary:'#292524',
  focusRing:'#E5E7EB',selection:'#374151',onSelection:'#F9FAFB',
  link:'#CBD5E1',visitedLink:'#D1D5DB'
});
const oceanLight=Object.freeze({
  primary:'#1D4ED8',onPrimary:'#FFFFFF',
  primaryContainer:'#DBEAFE',onPrimaryContainer:'#1E3A8A'
});
const oceanDark=Object.freeze({
  primary:'#93C5FD',onPrimary:'#172554',
  primaryContainer:'#1E3A8A',onPrimaryContainer:'#DBEAFE'
});
const curated=Object.freeze({
  neutral:Object.freeze({light:neutralLight,dark:neutralDark}),
  ocean:Object.freeze({light:oceanLight,dark:oceanDark})
});
/** Curated roles are stable in light/dark; custom seeds use generateTheme. */
export function getCuratedAccentRoles(accent,mode) {
  if(mode!=='light'&&mode!=='dark')return null;
  if(accent!=='neutral'&&accent!=='ocean')return null;
  return curated[accent][mode];
}
