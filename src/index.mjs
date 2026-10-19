/** GC UI v0.2 experimental web entry. Modules are framework-independent. */
export {generateTheme,contrastRatio} from './gc-color-engine.mjs';
export {GC_SURFACE_DEFAULTS,normalizeSurfaceConfig,resolveSurfaceEnvironment,createSurfaceController} from './gc-surface-runtime.mjs';
export {GC_MOTION_PRESETS,getMotionPreset,motionAllowed,playMotionPreset} from './gc-motion-presets.mjs';
export {createMotionCoordinator} from './gc-transition-coordinator.mjs';
export {GC_DEPTH_TIERS,resolveMaterialDepth} from './gc-material-depth.mjs';
export {GC_PLATFORM_PROFILES,resolvePlatformProfile,applyPlatformProfile} from './gc-platform-profile.mjs';
export {GC_NATIVE_PROTOCOL_VERSION,GC_NATIVE_ACTIONS,validateNativeHostRequest,createNativeTransport,createNativeHostClient,applyVerifiedHostCapabilities,resolveEffectiveNativePreferences} from './gc-native-host.mjs';
export {createChoreography} from './gc-choreography.mjs';
export {GC_THEME_DEFAULTS,normalizeTheme,resolveTheme,createThemeController} from './gc-theme-runtime.mjs';
export {nextTabIndex,initTabs,initDialog,createToast,runAsyncAction} from './gc-interactions.mjs';
export {nextMenuIndex,initMenu} from './gc-menu.mjs';
export {initChoiceChips,initDisclosureGroup} from './gc-patterns.mjs';
export {initPasswordReveal,initNumberStepper} from './gc-form-controls.mjs';
export const GC_UI_VERSION='0.2.0-alpha.1';
