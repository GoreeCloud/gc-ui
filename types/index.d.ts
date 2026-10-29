/** GC UI experimental web API: signatures may change before stable 1.0. */
export type GCAppearance='auto'|'light'|'dark';
export type GCAccent='neutral'|'ocean'|'iris'|'lagoon'|'ember'|'moss'|'custom';
export type GCMaterial='translucent'|'solid';
export type GCContrast='system'|'standard'|'high';

export interface GCThemeConfiguration {
  mode:GCAppearance;
  accent:GCAccent;
  material:GCMaterial;
  contrast:GCContrast;
  seed:`#${string}`;
}
export interface GCSystemPreferences {
  dark?:boolean;
  highContrast?:boolean;
  reducedTransparency?:boolean;
  forcedColors?:boolean;
}
export interface GCResolvedTheme extends Omit<GCThemeConfiguration,'mode'|'contrast'>{
  mode:'light'|'dark';
  contrast:'standard'|'high';
}
export interface GCColorScheme {
  seed:string;
  mode:'light'|'dark';
  roles:Record<string,string>;
  palettes:Record<string,Record<number,string>>;
  algorithm:'gc-oklch-1';
}
export interface GCThemeController {
  get():GCThemeConfiguration;
  resolved():GCResolvedTheme;
  set(patch:Partial<GCThemeConfiguration>):GCThemeConfiguration;
  reset():GCThemeConfiguration;
  destroy():void;
}
export interface GCThemeControllerOptions {
  root?:HTMLElement;
  media?:(query:string)=>MediaQueryList;
  storage?:Storage|null;
  key?:string;
  /** Product fallback only. Valid saved user accents always take precedence. */
  defaultAccent?:Exclude<GCAccent,'custom'>;
}
export declare const GC_THEME_DEFAULTS:Readonly<GCThemeConfiguration>;
export declare const GC_UI_VERSION:'0.2.0-alpha.1';
export declare function normalizeTheme(input?:Partial<GCThemeConfiguration>|null):GCThemeConfiguration;
export declare function resolveTheme(input?:Partial<GCThemeConfiguration>,system?:GCSystemPreferences):GCResolvedTheme;
export declare function createThemeController(options?:GCThemeControllerOptions):GCThemeController;
/** GC UI experimental product suggestions; unrecognized products are neutral. */
export declare const GC_PRODUCT_ACCENTS:Readonly<Record<string,Exclude<GCAccent,'custom'>>>;
export declare function getProductAccent(product?:unknown):Exclude<GCAccent,'custom'>;
export declare function createProductThemeController(options?:GCThemeControllerOptions&{product?:string}):GCThemeController;
export declare function generateTheme(seed:string,mode?:'light'|'dark'):GCColorScheme;
export declare function contrastRatio(a:string,b:string):number;

export interface GCTabController {
  select(tab:HTMLElement,options?:{focus?:boolean}):void;
  destroy():void;
}
export declare function nextTabIndex(key:string,current:number,length:number,options?:{rtl?:boolean}):number|null;
export declare function initTabs(tablist:HTMLElement,options?:{rtl?:boolean}):GCTabController;
export interface GCDialogController {
  open():void;
  close():void;
  destroy():void;
}
export declare function initDialog(dialog:HTMLDialogElement,options?:{document?:Document}):GCDialogController;
export interface GCToastController {
  show(message:string,options?:{duration?:number}):()=>void;
  dismiss():void;
  /** Cancel the toast and retire this instance. Later show() calls throw. */
  destroy():void;
}
export declare function createToast(region:HTMLElement):GCToastController;
export declare function runAsyncAction<T>(button:HTMLButtonElement,operation:()=>Promise<T>|T):Promise<T|null>;
export declare function nextMenuIndex(key:string,current:number,length:number):number|null;
export interface GCMenuController {
  open(position?:'first'|'last'):boolean;
  close(options?:{returnFocus?:boolean}):void;
  isOpen():boolean;
  destroy():void;
}
export interface GCMenuOptions {
  document?:Document;
  onSelect?:(item:HTMLElement,event:Event)=>void;
}
export declare function initMenu(trigger:HTMLButtonElement,menu:HTMLElement,options?:GCMenuOptions):GCMenuController;

/** Experimental native form controllers; not stable before GC UI 1.0. */
export interface GCPasswordRevealController {
  isRevealed():boolean;
  hide():boolean;
  destroy():void;
}
export declare function initPasswordReveal(input:HTMLInputElement,button:HTMLButtonElement):GCPasswordRevealController;

export interface GCNumberStepperController {
  get():number;
  set(value:number):number;
  destroy():void;
}
export declare function initNumberStepper(
  input:HTMLInputElement,
  decrease:HTMLButtonElement,
  increase:HTMLButtonElement,
  options?:{onChange?:(value:number)=>void}
):GCNumberStepperController;

/** Experimental native form-error summary. Not a stable validation framework. */
export interface GCValidationField {
 input:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement;
 error:HTMLElement;
 label:string;
 valid:(input:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement)=>boolean;
}
export interface GCValidationSummaryController {
 validate(options?:{focusSummary?:boolean}):boolean;
 destroy():void;
}
export declare function initValidationSummary(
 form:HTMLFormElement,summary:HTMLElement,list:HTMLUListElement,
 fields:GCValidationField[],
 options?:{onValid?:()=>void;onInput?:(input:GCValidationField['input'])=>void}
):GCValidationSummaryController;

/** Experimental material contexts. Never infer accessibility preferences from content. */
export type GCSurfaceContext='workspace'|'reading'|'analysis'|'media';
export type GCSurfaceIntensity='auto'|'quiet'|'balanced'|'expressive';
export type GCSurfaceIllumination='auto'|'soft'|'off';
export interface GCSurfaceConfiguration {
 context:GCSurfaceContext;
 intensity:GCSurfaceIntensity;
 illumination:GCSurfaceIllumination;
 lightDirection:'overhead'|'leading'|'trailing';
}
export interface GCSurfaceSystem {
 highContrast?:boolean;
 forcedColors?:boolean;
 reducedTransparency?:boolean;
 reducedMotion?:boolean;
}
export interface GCResolvedEnvironment {
 context:GCSurfaceContext;
 intensity:'quiet'|'balanced'|'expressive';
 illumination:'soft'|'off';
 lightDirection:'overhead'|'leading'|'trailing';
 solidLens:boolean;
 motionAllowed:boolean;
}
export interface GCSurfaceController {
 get():GCSurfaceConfiguration;
 resolved():GCResolvedEnvironment;
 set(patch:Partial<GCSurfaceConfiguration>):GCSurfaceConfiguration;
 reset():GCSurfaceConfiguration;
 destroy():void;
}
export interface GCSurfaceControllerOptions {
 root?:HTMLElement;
 media?:(query:string)=>MediaQueryList;
 storage?:Storage|null;
 key?:string;
}
export declare const GC_SURFACE_DEFAULTS:Readonly<GCSurfaceConfiguration>;
export declare function normalizeSurfaceConfig(input?:Partial<GCSurfaceConfiguration>|null):GCSurfaceConfiguration;
export declare function resolveSurfaceEnvironment(config?:Partial<GCSurfaceConfiguration>,system?:GCSurfaceSystem):GCResolvedEnvironment;
export declare function createSurfaceController(options?:GCSurfaceControllerOptions):GCSurfaceController;

export type GCMotionPreset='reveal'|'soften'|'settle'|'slideInline'|'dismiss'|'surfaceEnter'|'surfaceExit'|'press'|'nudgeInline';
export declare const GC_MOTION_PRESETS:Readonly<Record<GCMotionPreset,Readonly<Keyframe[]>>>;
export interface GCMotionOptions {
 direction?:'ltr'|'rtl';
 reducedMotion?:boolean;
 media?:(query:string)=>MediaQueryList;
 root?:HTMLElement;
}
export declare function getMotionPreset(name:GCMotionPreset,options?:GCMotionOptions):{
 frames:Keyframe[];timing:KeyframeAnimationOptions;
};
export declare function motionAllowed(options?:GCMotionOptions):boolean;
export declare function playMotionPreset(element:Element,name:GCMotionPreset,options?:GCMotionOptions):Animation|null;

/** Experimental managed transition API: one WAAPI animation per element. */
export interface GCMotionCoordinator {
 play(element:Element,name:GCMotionPreset,options?:{direction?:'ltr'|'rtl';reducedMotion?:boolean}):Animation|null;
 cancel(element:Element):boolean;
 cancelAll():void;
 activeCount():number;
 destroy():void;
}
export declare function createMotionCoordinator(options?:{
 media?:(query:string)=>MediaQueryList;
 root?:HTMLElement;
}):GCMotionCoordinator;

/** Experimental environment scene depth. Shadows never convey required state. */
export type GCDepthTier='e0'|'e1'|'e2'|'e3';
export type GCSurfacePurpose='background'|'content'|'active'|'overlay';
export interface GCDepthOptions {
 context?:GCSurfaceContext;
 purpose?:GCSurfacePurpose;
 requested?:GCDepthTier|null;
 highContrast?:boolean;
 forcedColors?:boolean;
 reducedTransparency?:boolean;
 lowPower?:boolean;
}
export declare const GC_DEPTH_TIERS:ReadonlyArray<GCDepthTier>;
export declare function resolveMaterialDepth(options?:GCDepthOptions):Readonly<{
 depth:GCDepthTier;
 context:GCSurfaceContext;
 purpose:GCSurfacePurpose;
 shadow:boolean;
 lens:boolean;
 decorativeLight:boolean;
}>;

/** Explicit platform design profiles—not native SDK bindings or OS detection. */
export type GCPlatformKind='web'|'phone'|'tablet'|'desktop'|'tv'|'wearable'|'spatial';
export interface GCPlatformSystem {
 highContrast?:boolean;
 forcedColors?:boolean;
 reducedMotion?:boolean;
 reducedTransparency?:boolean;
 lowPower?:boolean;
}
export interface GCPlatformProfile {
 kind:GCPlatformKind;
 targetPx:number;
 navigation:string;
 focus:string;
 maxDepth:GCDepthTier;
 motion:'none'|'standard'|'short';
 lens:'solid'|'bounded'|'host-managed';
 nativeAdapterInstalled:false;
}
export declare const GC_PLATFORM_PROFILES:Readonly<Record<GCPlatformKind,Readonly<{
 target:number;nav:string;focus:string;depth:GCDepthTier;motion:string;lens:string;
}>>>;
export declare function resolvePlatformProfile(kind?:GCPlatformKind,options?:GCPlatformSystem):Readonly<GCPlatformProfile>;
export declare function applyPlatformProfile(root:HTMLElement,kind:GCPlatformKind,options?:GCPlatformSystem):Readonly<GCPlatformProfile>;

export interface GCChoreography {
 play(items:Element[],options?:{
  preset?:GCMotionPreset;
  stagger?:number;
  direction?:'ltr'|'rtl';
  reducedMotion?:boolean;
 }):{animated:number;skipped:number};
 cancel():void;
 activeCount():number;
 destroy():void;
}
export declare function createChoreography(options?:{
 media?:(query:string)=>MediaQueryList;
 root?:HTMLElement;
}):GCChoreography;

/** Optional Android/Electron message bridge. Never exposes arbitrary native commands. */
export type GCNativeAction='getCapabilities'|'setAppearance'|'selectionFeedback';
export interface GCNativeCapabilities {
 protocol:1;
 host:'android'|'electron';
 platform:'phone'|'tablet'|'desktop';
 nativeAdapterInstalled:true;
 highContrast?:boolean;
 reducedMotion?:boolean;
 reducedTransparency?:boolean;
 lowPower?:boolean;
 selectionFeedback?:boolean;
 appearanceControl?:boolean;
}
export interface GCNativeTransport {
 platform?:string;
 postMessage(text:string):void;
 subscribe(listener:(event:{data:string}|string)=>void):()=>void;
}
export interface GCNativeHostClient {
 available:boolean;
 platform:string;
 request(action:GCNativeAction,payload?:{mode?:'system'|'light'|'dark'}):Promise<unknown>;
 destroy():void;
}
export declare const GC_NATIVE_PROTOCOL_VERSION:1;
export declare const GC_NATIVE_ACTIONS:ReadonlyArray<GCNativeAction>;
export declare function validateNativeHostRequest(value:string):{
 v:1;type:'gc-host/request';id:string;action:GCNativeAction;payload:Record<string,unknown>;
};
export declare function createNativeTransport(scope?:object):GCNativeTransport|null;
export declare function createNativeHostClient(options?:{transport?:GCNativeTransport|null;timeoutMs?:number}):GCNativeHostClient;
export declare function applyVerifiedHostCapabilities(root:HTMLElement,capabilities:GCNativeCapabilities,options?:GCPlatformSystem):
 Readonly<GCPlatformProfile&{nativeAdapterInstalled:true;selectionFeedback:boolean;appearanceControl:boolean}>;

/** Native accessibility/energy hints only increase browser safety restrictions. */
export declare function resolveEffectiveNativePreferences(
 browser?:GCPlatformSystem&{forcedColors?:boolean},
 native?:GCNativeCapabilities|null
):Readonly<Required<GCPlatformSystem>&{forcedColors:boolean}>;

/** Experimental opt-in native HTML pattern controllers. */
export interface GCChoiceChipsController {
 get():string;
 select(value:string,options?:{focus?:boolean}):boolean;
 destroy():void;
}
export declare function initChoiceChips(group:HTMLElement,options?:{
 onChange?:(value:string)=>void;
}):GCChoiceChipsController;
export interface GCDisclosureGroupController {
 expand(detail:HTMLDetailsElement):HTMLDetailsElement;
 getOpen():HTMLDetailsElement[];
 destroy():void;
}
export declare function initDisclosureGroup(group:HTMLElement,options?:{
 multiple?:boolean;
}):GCDisclosureGroupController;
