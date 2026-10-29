/**
 * GC UI product theme suggestions (experimental web contract).
 * A product provides a suggested accent, not a user-level preference.
 * User storage always has precedence through createThemeController.
 */
import {createThemeController, GC_THEME_DEFAULTS} from './gc-theme-runtime.mjs';

export const GC_PRODUCT_ACCENTS=Object.freeze({
  'gc-ui':'neutral',
  'messenger':'ocean',
  'notify':'lagoon',
  'dns':'moss',
  'wardveil':'neutral',
  'goreeshield':'neutral',
  'security-center':'neutral',
  'mesh':'neutral',
  'gateway':'neutral',
  'launcher':'neutral',
  'sync':'neutral',
  'search':'neutral',
  'monitor':'neutral',
  'vault':'neutral'
});

/** Unknown or malformed products are neutral, never the first curated hue. */
export function getProductAccent(product) {
  if(typeof product!=='string'||!/^([a-z0-9]+-?)+$/.test(product)) return GC_THEME_DEFAULTS.accent;
  const key=product.toLowerCase();
  return Object.hasOwn(GC_PRODUCT_ACCENTS,key)?GC_PRODUCT_ACCENTS[key]:GC_THEME_DEFAULTS.accent;
}

/**
 * Creates the standard controller with an app suggestion. An explicitly stored
 * theme choice takes precedence. The caller may provide root/media/storage/key
 * exactly as with createThemeController; product is never persisted by this API.
 */
export function createProductThemeController({product,...options}={}) {
  return createThemeController({...options,defaultAccent:getProductAccent(product)});
}
