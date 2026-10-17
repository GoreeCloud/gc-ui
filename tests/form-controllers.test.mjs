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
