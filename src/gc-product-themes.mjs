/**
 * Optional example product accents (experimental web contract).
 * Product identity alone must never enforce a default color.
 * Historic examples need explicit opt-in; saved user choices always win.
 */
import {createThemeController, GC_THEME_DEFAULTS} from './gc-theme-runtime.mjs';

/** Historical example colors, not product or ecosystem requirements. */
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

/** Lookup only: returning an example never applies it automatically. */
export function getProductAccent(product) {
  if(typeof product!=='string'||!/^([a-z0-9]+-?)+$/.test(product)) return GC_THEME_DEFAULTS.accent;
  const key=product.toLowerCase();
  return Object.hasOwn(GC_PRODUCT_ACCENTS,key)?GC_PRODUCT_ACCENTS[key]:GC_THEME_DEFAULTS.accent;
}

/**
 * App names never impose a color. Historical sample suggestions require
 * useProductSuggestion:true. Apps can still intentionally choose a local
 * defaultAccent, including a 'custom' defaultAccent with explicit validated
 * defaultSeed:'#RRGGBB'. Individual users can pick ANY separate seed with
 * set({accent:'custom',seed:'#RRGGBB'}).
 * Product names and example suggestions are never persisted as user choices.
 */
export function createProductThemeController({
  product,useProductSuggestion=false,...options
}={}) {
  const defaultAccent=Object.hasOwn(options,'defaultAccent')
    ? options.defaultAccent
    : useProductSuggestion===true
      ? getProductAccent(product)
      : GC_THEME_DEFAULTS.accent;
  return createThemeController({...options,defaultAccent});
}
