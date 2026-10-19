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
