/** Web-friendly platform design *profiles*, not native platform implementations or device detection. */
const table={
 web:{target:44,nav:'adaptive',focus:'keyboard-visible',depth:'e3',motion:'standard',lens:'bounded'},
 phone:{target:48,nav:'bottom',focus:'touch-and-keyboard',depth:'e2',motion:'standard',lens:'bounded'},
 tablet:{target:48,nav:'rail',focus:'touch-and-keyboard',depth:'e3',motion:'standard',lens:'bounded'},
 desktop:{target:44,nav:'sidebar',focus:'keyboard-visible',depth:'e3',motion:'standard',lens:'bounded'},
 tv:{target:64,nav:'directional',focus:'remote-prominent',depth:'e1',motion:'short',lens:'solid'},
 wearable:{target:48,nav:'single-task',focus:'rotary-or-touch',depth:'e0',motion:'short',lens:'solid'},
 spatial:{target:48,nav:'host-managed',focus:'host-native',depth:'e1',motion:'short',lens:'host-managed'}
};
export const GC_PLATFORM_PROFILES=Object.freeze(Object.fromEntries(
 Object.entries(table).map(([key,value])=>[key,Object.freeze({...value})])
));
export function resolvePlatformProfile(kind='web',{highContrast=false,forcedColors=false,reducedMotion=false,reducedTransparency=false,lowPower=false}={}){
 const id=Object.hasOwn(GC_PLATFORM_PROFILES,kind)?kind:'web';
 const base=GC_PLATFORM_PROFILES[id];
 const index=['e0','e1','e2','e3'];
 const constrained=highContrast||forcedColors;
 const cap=(constrained||lowPower)?0:index.indexOf(base.depth);
 return Object.freeze({
  kind:id,targetPx:base.target,navigation:base.nav,focus:base.focus,
  maxDepth:index[cap],
  motion:(reducedMotion||constrained)?'none':base.motion,
  lens:(constrained||reducedTransparency||lowPower)?'solid':base.lens,
  // Design guidance only: no OS keyboard, haptics or safe area APIs are called here.
  nativeAdapterInstalled:false
 });
}
export function applyPlatformProfile(root,kind,options={}){
 if(!root?.dataset)throw new TypeError('Root with dataset is required');
 const profile=resolvePlatformProfile(kind,options);
 root.dataset.gcPlatform=profile.kind;
 root.dataset.gcPlatformDepth=profile.maxDepth;
 root.dataset.gcPlatformLens=profile.lens;
 return profile;
}
