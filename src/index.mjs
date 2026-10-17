/** GC UI v0.2 experimental web entry. Modules are framework-independent. */
export {generateTheme,contrastRatio} from './gc-color-engine.mjs';
export {GC_SURFACE_DEFAULTS,normalizeSurfaceConfig,resolveSurfaceEnvironment,createSurfaceController} from './gc-surface-runtime.mjs';
export {GC_MOTION_PRESETS,getMotionPreset,motionAllowed,playMotionPreset} from './gc-motion-presets.mjs';
export {GC_THEME_DEFAULTS,normalizeTheme,resolveTheme,createThemeController} from './gc-theme-runtime.mjs';
export {nextTabIndex,initTabs,initDialog,createToast,runAsyncAction} from './gc-interactions.mjs';
export {nextMenuIndex,initMenu} from './gc-menu.mjs';
export {initPasswordReveal,initNumberStepper} from './gc-form-controls.mjs';
export const GC_UI_VERSION='0.2.0-alpha.1';
