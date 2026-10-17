import {createThemeController} from '../src/gc-theme-runtime.mjs';
import {createSurfaceController} from '../src/gc-surface-runtime.mjs';
import {resolveMaterialDepth} from '../src/gc-material-depth.mjs';
import {applyPlatformProfile} from '../src/gc-platform-profile.mjs';
import {createChoreography} from '../src/gc-choreography.mjs';
import {createNativeHostClient,applyVerifiedHostCapabilities,resolveEffectiveNativePreferences} from '../src/gc-native-host.mjs';

const root=document.documentElement;
const theme=createThemeController();
const environment=createSurfaceController({key:'gc-ui-experience:'});
const motion=createChoreography();
const host=createNativeHostClient();
let hostCapabilities=null;
let refreshingHost=null;
let nativeAppearanceSynced=false;
const scenes={
 workspace:{eyebrow:'WORKSPACE / FOCUS',title:'A clearer place to make.',description:'Tonal grouping and one focused plane help work stay organized.'},
 reading:{eyebrow:'READING / CALM',title:'Make clarity the centerpiece.',description:'Quiet materials protect long-form reading and reduce peripheral visual noise.'},
 analysis:{eyebrow:'ANALYSIS / STRUCTURE',title:'See the signal, not the shine.',description:'Crisp boundaries and restrained depth help comparisons remain readable.'}
};
const $=id=>document.getElementById(id);
// A presentation-only test fixture: no device settings are modified.
if(new URLSearchParams(location.search).get('gcPreview')==='conserve')
 $('conserve').checked=true;

function browserSystemOptions(){
 return {
  highContrast:root.dataset.gcContrast==='high'||matchMedia('(prefers-contrast: more)').matches,
  forcedColors:matchMedia('(forced-colors: active)').matches,
  reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
  reducedTransparency:matchMedia('(prefers-reduced-transparency: reduce)').matches
 };
}
function systemOptions(){
 const effective=resolveEffectiveNativePreferences(browserSystemOptions(),hostCapabilities);
 // User-directed Studio preview may only strengthen native/browser restrictions.
 return {...effective,lowPower:effective.lowPower||$('conserve').checked};
}
function render(){
 const scene=$('scene').value,platform=$('platform').value,purpose=$('detail').value;
 const options=systemOptions();
 const profile=applyPlatformProfile(root,platform,options);
 environment.set({context:scene});
 root.dataset.gcResourceMode=options.lowPower?'conserve':'normal';
 root.dataset.gcHostContrast=hostCapabilities?.highContrast?'high':'standard';
 root.dataset.gcHostTransparency=hostCapabilities?.reducedTransparency?'reduce':'normal';
 const depth=resolveMaterialDepth({context:scene,purpose,...options,lowPower:options.lowPower||platform==='tv'||platform==='wearable'});
 const steps=['e0','e1','e2','e3'];
 const effective=steps[Math.min(steps.indexOf(depth.depth),steps.indexOf(profile.maxDepth))];
 $('feature').dataset.gcDepth=effective;
 const meta=scenes[scene];
 $('scene-eyebrow').textContent=meta.eyebrow;
 $('scene-title').textContent=meta.title;
 $('scene-description').textContent=meta.description;
 $('scene-use').setAttribute('href','../assets/gc-scenes.svg#gc-scene-'+scene);
 $('profile-status').textContent=
  'Profile: '+profile.kind+' · navigation: '+profile.navigation+' · targets: '+profile.targetPx+
  'px · effective depth: '+effective.toUpperCase()+' · motion: '+profile.motion+'.';
 $('appearance').textContent=theme.resolved().mode==='dark'?'Light mode':'Dark mode';
 $('appearance').setAttribute('aria-label','Switch to '+(theme.resolved().mode==='dark'?'light':'dark')+' appearance');
}
async function refreshHostCapabilities(){
 if(!host.available)return;
 if(refreshingHost)return refreshingHost;
 if(!hostCapabilities)$('host-status').textContent='Connecting to native host…';
 const task=(async()=>{
  try{
   const capabilities=await host.request('getCapabilities');
   const previousHostPlatform=hostCapabilities?.platform;
   const profile=applyVerifiedHostCapabilities(root,capabilities,browserSystemOptions());
   const wasNativeProfile=!hostCapabilities||$('platform').value===previousHostPlatform;
   hostCapabilities=capabilities;
   if(wasNativeProfile)$('platform').value=profile.kind;
   $('host-feedback').disabled=!profile.selectionFeedback;
   $('host-status').textContent='Native '+capabilities.host+' host connected · '+profile.kind+' profile.';
   if(profile.motion==='none'||capabilities.lowPower)motion.cancel();
   render();
   // Only synchronize once; later user appearance interactions have explicit callbacks.
   if(profile.appearanceControl&&!nativeAppearanceSynced){
    nativeAppearanceSynced=true;
    host.request('setAppearance',{mode:theme.resolved().mode}).catch(()=>{nativeAppearanceSynced=false});
   }
  }catch{
   // A failed refresh cannot retain stale native privileges or energy claims.
   hostCapabilities=null;
   nativeAppearanceSynced=false;
   delete root.dataset.gcNativeHost;
   $('host-feedback').disabled=true;
   $('host-status').textContent='Native bridge unavailable; browser preview remains usable.';
   motion.cancel();
   render();
  }
 })();
 refreshingHost=task;
 try{await task}finally{if(refreshingHost===task)refreshingHost=null}
}
$('host-feedback').addEventListener('click',async()=>{
 if(!hostCapabilities?.selectionFeedback)return;
 try{
  const feedback=await host.request('selectionFeedback');
  $('host-status').textContent=feedback?.performed?'Native selection feedback performed.':'Native selection feedback was not available.';
 }catch{$('host-status').textContent='Native selection feedback request failed.';}
});
for(const id of ['scene','platform','detail'])$(id).addEventListener('change',()=>{motion.cancel();render()});
$('appearance').addEventListener('click',()=>{
 theme.set({mode:theme.resolved().mode==='dark'?'light':'dark'});render();
 if(hostCapabilities?.appearanceControl){
  host.request('setAppearance',{mode:theme.resolved().mode}).catch(()=>{
   $('host-status').textContent='Native appearance update unavailable; browser appearance still works.';
  });
 }
});
$('animate').addEventListener('click',()=>{
 const result=motion.play([document.querySelector('.scene-art'),document.querySelector('.feature-copy'),document.querySelector('.rail')],{
  preset:'reveal',reducedMotion:$('reduced').checked||systemOptions().reducedMotion||systemOptions().lowPower
 });
 $('profile-status').textContent=result.animated?'Played a bounded three-part transition.':'Motion skipped; content remains visible.';
});
$('cancel').addEventListener('click',()=>{motion.cancel();$('profile-status').textContent='Transition stopped. Content remains visible.'});
$('reduced').addEventListener('change',()=>{if($('reduced').checked)motion.cancel()});
$('conserve').addEventListener('change',()=>{motion.cancel();render()});
root.addEventListener('gc-theme-change',render);
for(const q of ['(prefers-reduced-motion: reduce)','(forced-colors: active)','(prefers-contrast: more)','(prefers-reduced-transparency: reduce)']){
 matchMedia(q).addEventListener?.('change',render);
}
// Refresh permissions/energy/accessibility when returning from Android system settings
// or restoring the desktop host; one request at a time prevents duplicate handshakes.
window.addEventListener('focus',()=>{if(!document.hidden)refreshHostCapabilities()});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden)refreshHostCapabilities();
});
render();
refreshHostCapabilities();
