import test from 'node:test';
import assert from 'node:assert/strict';
import {initPasswordReveal,initNumberStepper} from '../src/index.mjs';

function control(localName,type,options={}){
 const listeners=new Map(),attributes=new Map(Object.entries(options.attributes||{}));
 return {
  localName,type,value:options.value||'',min:options.min||'',max:options.max||'',
  step:options.step||'',disabled:false,textContent:options.textContent||'',focusCount:0,
  getAttribute:name=>attributes.get(name)||null,
  setAttribute(name,value){attributes.set(name,String(value))},
  removeAttribute(name){attributes.delete(name)},
  addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn)},
  removeEventListener(name,fn){listeners.get(name)?.delete(fn)},
  dispatch(name){for(const fn of [...(listeners.get(name)||[])])fn({type:name})},
  listenerCount(name){return listeners.get(name)?.size||0},
  focus(){this.focusCount++}
 };
}
const pass=()=>control('input','password',{value:'invented-sample'});
const reveal=()=>control('button','button',{textContent:'Show',attributes:{'aria-label':'Reveal sample passphrase'}});
const number=props=>control('input','number',{value:'3',min:'1',max:'12',step:'1',...props});
const btn=()=>control('button','button');

test('reveal controller preserves input, reports pressed state, and masks on teardown',()=>{
 const field=pass(),button=reveal(),controller=initPasswordReveal(field,button);
 assert.equal(button.getAttribute('aria-pressed'),'false');
 assert.equal(controller.isRevealed(),false);
 button.dispatch('click');
 assert.equal(field.type,'text');
 assert.equal(field.value,'invented-sample');
 assert.equal(button.getAttribute('aria-pressed'),'true');
 assert.equal(button.textContent,'Hide');
 assert.equal(button.getAttribute('aria-label'),'Reveal sample passphrase');
 controller.destroy();
 assert.equal(field.type,'password');
 assert.equal(controller.isRevealed(),false);
 assert.equal(button.listenerCount('click'),0);
 assert.equal(field.value,'invented-sample');
 controller.destroy();
 button.dispatch('click');
 assert.equal(field.type,'password');
 assert.throws(()=>controller.hide(),/destroyed/);
});

test('reveal controller does not let an unlabeled control masquerade as accessible',()=>{
 assert.throws(()=>initPasswordReveal(pass(),control('button','button')),/stable accessible/);
 assert.throws(()=>initPasswordReveal(control('input','text'),reveal()),/password input/);
 assert.throws(()=>initPasswordReveal(pass(),control('button','submit')),/type=button/);
});

test('localized reveal labels replace only controller-owned visible text and restore host text',()=>{
 const field=pass(),button=reveal();
 const api=initPasswordReveal(field,button,{labels:{show:'Mostrar',hide:'Ocultar'}});
 assert.equal(button.textContent,'Mostrar','localization applies before the first click');
 assert.equal(button.getAttribute('aria-label'),'Reveal sample passphrase');
 button.dispatch('click');
 assert.equal(field.type,'text');
 assert.equal(button.textContent,'Ocultar');
 assert.equal(button.getAttribute('aria-pressed'),'true');
 api.hide();
 assert.equal(field.type,'password');
 assert.equal(button.textContent,'Mostrar');
 api.destroy();
 assert.equal(button.textContent,'Show','teardown restores the host label');
 assert.equal(field.value,'invented-sample');
});

test('localized password reveal preserves icon children and later host labels',()=>{
 const field=pass(),button=reveal(),visible={textContent:'Show'};
 button.childElementCount=2;
 button.querySelector=selector=>selector==='[data-gc-password-reveal-label]'?visible:null;
 const api=initPasswordReveal(field,button,{labels:{show:'Vis',hide:'Skjul'}});
 assert.equal(visible.textContent,'Vis');
 button.dispatch('click');
 assert.equal(visible.textContent,'Skjul');
 visible.textContent='Host override';
 api.destroy();
 assert.equal(visible.textContent,'Host override');
 assert.equal(field.type,'password');
 assert.equal(button.textContent,'Show','icon-containing host markup stays untouched');
});

test('localized reveal rejects incomplete, whitespace-only or non-string labels before mounting',()=>{
 for(const labels of [null,{}, {show:'',hide:'Hide'}, {show:'Show',hide:'  '},
   {show:'Show'}, {hide:'Hide'}, {show:4,hide:'Hide'}]){
  const field=pass(),button=reveal();
  assert.throws(()=>initPasswordReveal(field,button,{labels}),/nonempty show and hide/);
  assert.equal(button.listenerCount('click'),0);
  assert.equal(button.getAttribute('aria-pressed'),null);
  assert.equal(button.textContent,'Show');
  assert.equal(field.type,'password');
 }
});

test('integer stepper clamps manual edits and disables controls at real boundaries',()=>{
 const field=number(),dec=btn(),inc=btn(),events=[];
 const api=initNumberStepper(field,dec,inc,{onChange:n=>events.push(n)});
 assert.equal(api.get(),3);
 assert.deepEqual(events,[3]);
 assert.equal(dec.disabled,false);
 inc.dispatch('click');
 assert.equal(api.get(),4);
 assert.equal(field.focusCount,1);
 field.value='99';
 field.dispatch('change');
 assert.equal(api.get(),12);
 assert.equal(inc.disabled,true);
 field.value='-4';
 field.dispatch('change');
 assert.equal(api.get(),1);
 assert.equal(dec.disabled,true);
 field.value='';
 field.dispatch('change');
 assert.equal(api.get(),1);
 api.set(8.8);
 assert.equal(api.get(),9);
 assert.equal(dec.disabled,false);
 assert.equal(inc.disabled,false);
 api.destroy();
 assert.equal(field.listenerCount('change'),0);
 assert.equal(dec.listenerCount('click'),0);
 assert.equal(inc.listenerCount('click'),0);
 inc.dispatch('click');
 assert.equal(api.get(),9);
 assert.throws(()=>api.set(10),/destroyed/);
 api.destroy();
});

test('stepper supports finite nonunit integer steps and resists nonnumeric updates',()=>{
 const field=number({value:'6',min:'1',max:'11',step:'2'});
 const dec=btn(),inc=btn(),api=initNumberStepper(field,dec,inc);
 assert.equal(api.get(),7);
 dec.dispatch('click');
 assert.equal(api.get(),5);
 assert.equal(api.set(Number.POSITIVE_INFINITY),1);
 field.value='not-a-number';
 field.dispatch('change');
 assert.equal(api.get(),1);
 api.destroy();
});

test('stepper rejects ambiguous or malformed native range contracts',()=>{
 const invalid=[
  {min:'1',max:'10',step:'2'},
  {min:'',max:'12',step:'1'},
  {min:'1',max:'12',step:'0'},
  {min:'1',max:'1',step:'1'},
  {min:'1',max:'12',step:'any'}
 ];
 for(const options of invalid){
  assert.throws(()=>initNumberStepper(number(options),btn(),btn()),RangeError);
 }
 assert.throws(()=>initNumberStepper(number(),btn(),btn(),{onChange:true}),/function/);
 assert.throws(()=>initNumberStepper(number(),btn(),control('button','submit')),/type=button/);
});

test('password reveal preserves nested SVG markup and only changes marked visible label text',()=>{
 const field=pass(),button=reveal(),label={textContent:'View'};
 const icon={localName:'svg'};
 button.childElementCount=2;
 button.querySelector=selector=>selector==='[data-gc-password-reveal-label]'?label:null;
 button.children=[icon,label];
 button.setAttribute('aria-pressed','mixed');
 const api=initPasswordReveal(field,button);
 button.dispatch('click');
 assert.equal(field.type,'text');
 assert.equal(button.children[0],icon,'nested SVG must survive interaction');
 assert.equal(label.textContent,'Hide');
 api.destroy();
 assert.equal(field.type,'password');
 assert.equal(button.children[0],icon);
 assert.equal(label.textContent,'View','original host label restored');
 assert.equal(button.getAttribute('aria-pressed'),'mixed','original ARIA restored');
});

test('icon-only password toggle must not replace host-owned markup or override later ARIA changes',()=>{
 const field=pass(),button=reveal(),icon={localName:'svg'};
 button.childElementCount=1;
 button.querySelector=()=>null;
 button.children=[icon];
 button.textContent='original-icon';
 const api=initPasswordReveal(field,button);
 button.dispatch('click');
 assert.equal(button.children[0],icon);
 assert.equal(button.textContent,'original-icon');
 button.setAttribute('aria-pressed','external');
 api.destroy();
 assert.equal(field.type,'password','retiring a controller always masks its password');
 assert.equal(button.getAttribute('aria-pressed'),'external');
 assert.equal(button.textContent,'original-icon');
});

test('password controller restores original plain label only when still its last write',()=>{
 const field=pass(),button=reveal(),api=initPasswordReveal(field,button);
 button.dispatch('click');
 button.textContent='Host changed this label';
 api.destroy();
 assert.equal(button.textContent,'Host changed this label');
 assert.equal(button.getAttribute('aria-pressed'),null);
});

test('number stepper restores borrowed disabled flags on teardown and keeps newer changes',()=>{
 const field=number({value:'1'}),dec=btn(),inc=btn();
 dec.disabled=true;inc.disabled=true;
 const api=initNumberStepper(field,dec,inc);
 assert.equal(dec.disabled,true);assert.equal(inc.disabled,false);
 field.value='12';field.dispatch('change');
 assert.equal(dec.disabled,false);assert.equal(inc.disabled,true);
 // The host changes the decrement state after the controller's last update.
 dec.disabled=true;
 api.destroy();
 assert.equal(dec.disabled,true,'later app change preserved');
 assert.equal(inc.disabled,true,'pre-mount disabled state restored');
 api.destroy();
});

test('number stepper restores originally enabled controls regardless of terminal limit',()=>{
 const field=number({value:'12'}),dec=btn(),inc=btn();
 const api=initNumberStepper(field,dec,inc);
 assert.equal(inc.disabled,true);
 api.destroy();
 assert.equal(dec.disabled,false);
 assert.equal(inc.disabled,false);
});

test('failed stepper initial callback leaves no listeners, borrowed DOM writes or normalized input behind',()=>{
 const field=number({value:'3.7',min:'1',max:'11',step:'2'});
 const dec=btn(),inc=btn();
 dec.disabled=true;inc.disabled=true;
 assert.throws(()=>initNumberStepper(field,dec,inc,{onChange(){throw Error('Host initialization rejected')}}),/Host initialization rejected/);
 assert.equal(field.value,'3.7','failed initialization must not replace host-entered value');
 assert.equal(dec.disabled,true);
 assert.equal(inc.disabled,true);
 assert.equal(field.listenerCount('change'),0);
 assert.equal(dec.listenerCount('click'),0);
 assert.equal(inc.listenerCount('click'),0);
 field.dispatch('change');inc.dispatch('click');
 assert.equal(field.value,'3.7','stale listeners must never mutate failed mount');
});

test('stepper may be safely retried after an initialization callback throws',()=>{
 const field=number({value:'4',min:'1',max:'11',step:'2'}),dec=btn(),inc=btn();
 assert.throws(()=>initNumberStepper(field,dec,inc,{onChange(){throw Error('temporary')}}),/temporary/);
 const changes=[];
 const active=initNumberStepper(field,dec,inc,{onChange:n=>changes.push(n)});
 assert.deepEqual(changes,[5]);
 assert.equal(field.listenerCount('change'),1);
 inc.dispatch('click');
 assert.equal(field.value,'7');
 assert.deepEqual(changes,[5,7]);
 active.destroy();
 assert.equal(field.listenerCount('change'),0);
});

test('rejected later stepper updates roll back the last accepted value and boundary flags',()=>{
 const field=number({value:'4'}),dec=btn(),inc=btn(),seen=[];
 const api=initNumberStepper(field,dec,inc,{onChange:n=>{
  seen.push(n);
  if(n===12)throw new Error('application rejected maximum');
 }});
 assert.equal(api.set(5),5);
 assert.equal(field.value,'5');
 assert.throws(()=>api.set(12),/application rejected maximum/);
 assert.equal(field.value,'5','a rejected programmatic update should retain the last accepted value');
 assert.equal(inc.disabled,false,'rejected bound must not leave increment disabled');
 field.value='12'; // manual editing happens before the native change event
 assert.throws(()=>field.dispatch('change'),/application rejected maximum/);
 assert.equal(field.value,'5','rejected manual edit must roll back to last accepted value');
 assert.equal(dec.disabled,false);
 assert.equal(inc.disabled,false);
 api.destroy();
});

test('stepper rollback does not erase host changes made inside a throwing callback',()=>{
 const field=number({value:'3'}),dec=btn(),inc=btn();
 const api=initNumberStepper(field,dec,inc,{onChange:n=>{
  if(n===12){
   field.value='9'; // application took new ownership before signaling failure
   dec.disabled=true;
   throw new Error('host override');
  }
 }});
 assert.throws(()=>api.set(12),/host override/);
 assert.equal(field.value,'9','host-owned value must not be overwritten by rollback');
 assert.equal(dec.disabled,true,'host-owned disabled button must survive rollback');
 assert.equal(inc.disabled,false,'other button can roll back');
 api.destroy();
 assert.equal(dec.disabled,true,'teardown must not erase newer host button state');
});

test('a rejected outer number update cannot overwrite a newer accepted nested boundary state',()=>{
 const field=number({value:'4'}),dec=btn(),inc=btn();
 let api;
 api=initNumberStepper(field,dec,inc,{onChange:n=>{
  if(n===12){api.set(1);throw Error('outer request rejected')}
 }});
 assert.throws(()=>api.set(12),/outer request rejected/);
 assert.equal(field.value,'1','the newer accepted nested update must win');
 assert.equal(api.get(),1);
 assert.equal(dec.disabled,true,'minimum boundary remains disabled after nested acceptance');
 assert.equal(inc.disabled,false);
 api.destroy();
});


test('stepper click does not reclaim focus after callback destroys the controller',()=>{
 for(const direction of ['decrement','increment']){
  const field=number({value:'5'}),dec=btn(),inc=btn();
  let api;
  api=initNumberStepper(field,dec,inc,{onChange:value=>{
   if(value!==5)api.destroy();
  }});
  (direction==='decrement'?dec:inc).dispatch('click');
  assert.equal(field.focusCount,0);
  assert.equal(field.listenerCount('change'),0);
  assert.equal(dec.listenerCount('click'),0);
  assert.equal(inc.listenerCount('click'),0);
 }
});

test('stepper does not focus a field detached during its change callback',()=>{
 const field=number({value:'5'}),dec=btn(),inc=btn();
 field.isConnected=true;
 const api=initNumberStepper(field,dec,inc,{onChange:value=>{
  if(value===6)field.isConnected=false;
 }});
 inc.dispatch('click');
 assert.equal(field.value,'6');
 assert.equal(field.focusCount,0);
 api.destroy();
});

test('password reveal ignores unavailable controls, including synthetic host-disabled clicks',()=>{
 const field=pass(),button=reveal(),api=initPasswordReveal(field,button);
 const cases=[
  [()=>button.disabled=true,()=>button.disabled=false],
  [()=>button.hidden=true,()=>button.hidden=false],
  [()=>button.inert=true,()=>button.inert=false],
  [()=>button.setAttribute('aria-disabled','true'),()=>button.removeAttribute('aria-disabled')],
  [()=>button.setAttribute('aria-hidden','true'),()=>button.removeAttribute('aria-hidden')],
  [()=>button.matches=()=>true,()=>delete button.matches],
  [()=>button.closest=()=>({}),()=>delete button.closest],
  [()=>button.isConnected=false,()=>button.isConnected=true],
  [()=>field.disabled=true,()=>field.disabled=false]
 ];
 for(const [disable,enable] of cases){
  disable();button.dispatch('click');
  assert.equal(field.type,'password','unavailable control cannot reveal the value');
  assert.equal(button.getAttribute('aria-pressed'),'false');
  enable();
 }
 button.dispatch('click');
 assert.equal(field.type,'text','available button recovers');
 button.hidden=true;
 api.hide(); // Explicit API remains usable for security-sensitive masking.
 assert.equal(field.type,'password');
 api.destroy();
});

test('number stepper ignores synthetic events from disabled, hidden or host-disabled controls',()=>{
 const field=number(),dec=btn(),inc=btn(),changes=[];
 const api=initNumberStepper(field,dec,inc,{onChange:n=>changes.push(n)});
 const cases=[
  [()=>inc.disabled=true,()=>inc.disabled=false],
  [()=>inc.hidden=true,()=>inc.hidden=false],
  [()=>inc.inert=true,()=>inc.inert=false],
  [()=>inc.setAttribute('aria-disabled','true'),()=>inc.removeAttribute('aria-disabled')],
  [()=>inc.setAttribute('aria-hidden','true'),()=>inc.removeAttribute('aria-hidden')],
  [()=>inc.matches=()=>true,()=>delete inc.matches],
  [()=>inc.closest=()=>({}),()=>delete inc.closest],
  [()=>inc.isConnected=false,()=>inc.isConnected=true],
  [()=>field.disabled=true,()=>field.disabled=false]
 ];
 for(const [disable,enable] of cases){
  disable();
  inc.dispatch('click');
  assert.equal(api.get(),3,'no unavailable increment');
  assert.deepEqual(changes,[3],'no callbacks for unavailable controls');
  enable();
 }
 field.hidden=true;
 field.value='8';
 field.dispatch('change');
 assert.deepEqual(changes,[3],'hidden input ignores synthetic change');
 field.hidden=false;
 api.set(3);
 inc.dispatch('click');
 assert.equal(api.get(),4,'re-enabled increment works');
 dec.setAttribute('aria-disabled','true');
 dec.dispatch('click');
 assert.equal(api.get(),4,'host-disabled decrement is ignored');
 dec.removeAttribute('aria-disabled');
 dec.dispatch('click');
 assert.equal(api.get(),3);
 api.destroy();
});
