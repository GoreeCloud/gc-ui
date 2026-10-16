/** GC UI experimental web API: signatures may change before stable 1.0. */
export type GCAppearance='auto'|'light'|'dark';
export type GCAccent='iris'|'lagoon'|'ember'|'moss'|'custom';
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
}
export declare const GC_THEME_DEFAULTS:Readonly<GCThemeConfiguration>;
export declare const GC_UI_VERSION:'0.2.0-alpha.1';
export declare function normalizeTheme(input?:Partial<GCThemeConfiguration>|null):GCThemeConfiguration;
export declare function resolveTheme(input?:Partial<GCThemeConfiguration>,system?:GCSystemPreferences):GCResolvedTheme;
export declare function createThemeController(options?:GCThemeControllerOptions):GCThemeController;
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
