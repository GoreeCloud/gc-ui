/** GC UI custom seed color engine v1 candidate.
 * Independently designed OKLCH tonal mapping; NOT Google's HCT algorithm.
 * Pure functions. This does not access the user's wallpaper.
 */
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
function assertHex(hex){
  if(typeof hex!=='string'||!/^#[\da-fA-F]{6}$/.test(hex))throw new TypeError('Expected opaque #RRGGBB seed');
  return hex.toUpperCase();
}
const toLinear=x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);
const fromLinear=x=>x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055;
function parse(hex){hex=assertHex(hex);return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
function toHex(rgb){return '#'+rgb.map(x=>Math.round(clamp(fromLinear(clamp(x,0,1)),0,1)*255).toString(16).padStart(2,'0')).join('').toUpperCase();}
function toOklch(hex){
  const [r,g,b]=parse(hex).map(toLinear);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const L=.2104542553*l+.7936177850*m-.0040720468*s;
  const a=1.9779984951*l-2.4285922050*m+.4505937099*s;
  const bb=.0259040371*l+.7827717662*m-.8086757660*s;
  return {L,C:Math.hypot(a,bb),h:((Math.atan2(bb,a)*180/Math.PI)+360)%360};
}
function toRgb(L,C,h){
  const rad=h*Math.PI/180,a=C*Math.cos(rad),b=C*Math.sin(rad);
  const ll=Math.pow(L+.3963377774*a+.2158037573*b,3);
  const mm=Math.pow(L-.1055613458*a-.0638541728*b,3);
  const ss=Math.pow(L-.0894841775*a-1.2914855480*b,3);
  return [
    4.0767416621*ll-3.3077115913*mm+.2309699292*ss,
    -1.2684380046*ll+2.6097574011*mm-.3413193965*ss,
    -.0041960863*ll-.7034186147*mm+1.7076147010*ss
  ];
}
function gamutTone(L,C,h){
  for(let i=0;i<96;i++){
    const rgb=toRgb(L,C,h);
    if(rgb.every(x=>x>=-0.0000001&&x<=1.0000001))return toHex(rgb);
    C*=.94;
  }
  return toHex(toRgb(L,0,h));
}
function luminance(hex){
  const [r,g,b]=parse(hex).map(toLinear);
  return .2126*r+.7152*g+.0722*b;
}
export function contrastRatio(a,b){
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function readable(bg,preferred){
  if(contrastRatio(bg,preferred)>=4.5)return preferred;
  const black='#000000',white='#FFFFFF';
  return contrastRatio(bg,black)>contrastRatio(bg,white)?black:white;
}
const steps=[0,5,10,20,30,40,50,60,70,80,90,95,98,100];
const pairs=[['primary',40,100,80,20],['primaryContainer',90,10,30,90],['secondary',40,100,80,20],['secondaryContainer',90,10,30,90],['tertiary',40,100,80,20],['tertiaryContainer',90,10,30,90]];
function makeFamily(h,C){return Object.fromEntries(steps.map(t=>[t,gamutTone(t/100,C,h)]));}
export function generateTheme(seed,mode='light'){
  seed=assertHex(seed);
  if(mode!=='light'&&mode!=='dark')throw new TypeError('mode must be light or dark');
  const base=toOklch(seed);
  const families={
    primary:makeFamily(base.h,clamp(base.C,.065,.22)),
    secondary:makeFamily(base.h,clamp(base.C*.42,.025,.085)),
    tertiary:makeFamily((base.h+65)%360,clamp(base.C*.65,.045,.13)),
    neutral:makeFamily(base.h,Math.min(.018,base.C*.12)),
    neutralVariant:makeFamily(base.h,Math.min(.04,base.C*.24))
  };
  const roles={};
  const dark=mode==='dark';
  for(const [id,lBg,lFg,dBg,dFg] of pairs){
    const family=id.startsWith('primary')?'primary':id.startsWith('secondary')?'secondary':'tertiary';
    const bg=families[family][dark?dBg:lBg],on=readable(bg,families[family][dark?dFg:lFg]);
    roles[id]=bg;roles['on'+id[0].toUpperCase()+id.slice(1)]=on;
  }
  const n=families.neutral,v=families.neutralVariant;
  roles.canvas=n[dark?10:95];roles.surface=n[dark?20:98];roles.surfaceRaised=n[dark?30:100];
  roles.surfaceTonal=v[dark?20:90];roles.surfaceInset=n[dark?5:90];
  roles.onCanvas=readable(roles.canvas,n[dark?95:10]);
  roles.onSurface=readable(roles.surface,n[dark?95:10]);
  roles.onSurfaceMuted=readable(roles.surface,n[dark?80:30]);
  roles.outline=v[dark?70:50];roles.outlineStrong=v[dark?80:40];
  roles.divider=v[dark?30:90];roles.focusRing=roles.primary;
  roles.selection=roles.primaryContainer;roles.onSelection=roles.onPrimaryContainer;
  roles.inverseSurface=n[dark?95:20];roles.inverseOnSurface=readable(roles.inverseSurface,n[dark?10:98]);
  return {seed,mode,roles,palettes:families,algorithm:'gc-oklch-1'};
}
