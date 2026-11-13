import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initAvailabilityFeedback } from '../src/availability.js';

function node(tagName, attributes = {}, parentNode = null) {
  return {
    tagName, parentNode,
    type: attributes.type || 'button',
    getAttribute(key) { return attributes[key] ?? null; },
  };
}
function fixture() {
  const handlers = new Map();
  const root = {
    addEventListener(name, handler, capture) { assert.equal(capture, true); handlers.set(name, handler); },
    removeEventListener(name, handler, capture) { assert.equal(capture, true); if (handlers.get(name) === handler) handlers.delete(name); },
  };
  const messages = [];
  const dispose = initAvailabilityFeedback(root, { notify: message => messages.push(message) });
  function fire(target, type = 'click', submitter = null) {
    const event = {
      target, submitter, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; },
      stopImmediatePropagation() { this.stopped = true; },
    };
    handlers.get(type)?.(event);
    return event;
  }
  return { root, messages, fire, dispose, handlers };
}

test('planned native actions announce without navigation or downstream execution', () => {
  const f = fixture();
  const button = node('BUTTON', {'data-gc-availability':'planned','data-gc-feature':'Mesh status'}, f.root);
  const inner = node('SPAN', {}, button);
  const event = f.fire(inner);
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
  assert.deepEqual(f.messages, ['Mesh status is not available yet.']);
  f.dispose();
  assert.equal(f.handlers.size, 0);
  assert.equal(f.fire(button).prevented, false);
});

test('native anchor/submit actions are intercepted; implemented controls unaffected', () => {
  const f = fixture();
  for (const control of [node('A', {'data-gc-availability':'unavailable'}, f.root),
    node('INPUT', {type:'submit', 'data-gc-availability':'planned'}, f.root)]) {
    assert.equal(f.fire(control).prevented, true);
  }
  assert.equal(f.fire(node('BUTTON', {'data-gc-availability':'implemented'}, f.root)).prevented, false);
  assert.equal(f.fire(node('DIV', {'data-gc-availability':'planned'}, f.root)).prevented, false);
  assert.deepEqual(f.messages, ['Not available yet.']); // duplicate notifications collapse
  f.dispose();
});

test('untrusted feature names are text passed to notifier, never executed or rendered as HTML', () => {
  const f = fixture();
  const label = '<img onerror=alert(1)>';
  f.fire(node('BUTTON', {'data-gc-availability':'planned','data-gc-feature':label},f.root));
  assert.equal(f.messages[0], label + ' is not available yet.');
  f.dispose();
});

test('invalid roots and notifiers reject before registering listeners', () => {
  assert.throws(() => initAvailabilityFeedback(null), TypeError);
  assert.throws(() => initAvailabilityFeedback({}, {notify:()=>{}}), TypeError);
  assert.throws(() => initAvailabilityFeedback({addEventListener(){}, removeEventListener(){}}, {notify:'bad'}), TypeError);
});


test('planned form submit from Enter or requestSubmit is blocked and announces the feature', () => {
  const f = fixture();
  const form = node('FORM', {'data-gc-availability':'planned','data-gc-feature':'Cloud sync setup'}, f.root);
  const input = node('INPUT', { type:'text' }, form);
  assert.equal(f.fire(input).prevented, false, 'normal input clicks remain usable');
  const submit = f.fire(form, 'submit');
  assert.equal(submit.prevented, true);
  assert.equal(submit.stopped, true);
  assert.deepEqual(f.messages, ['Cloud sync setup is not available yet.']);
  f.dispose();
  assert.equal(f.handlers.size, 0);
  assert.equal(f.fire(form, 'submit').prevented, false);
});

test('a planned submitter is blocked even when its parent form is implemented', () => {
  const f = fixture();
  const form = node('FORM', {}, f.root);
  const save = node('BUTTON', {'data-gc-availability':'planned','data-gc-feature':'Export'}, form);
  assert.equal(f.fire(form, 'submit', save).prevented, true);
  assert.equal(f.fire(form, 'submit').prevented, false);
  assert.equal(f.fire(node('DIV', {}, f.root), 'submit', save).prevented, false);
  assert.deepEqual(f.messages, ['Export is not available yet.']);
  f.dispose();
});


test('planned action on the event root itself cannot escape interception', () => {
  const f=fixture();
  f.root.tagName='BUTTON';
  f.root.getAttribute=key=>key==='data-gc-availability'?'planned':key==='data-gc-feature'?'Root action':null;
  const event=f.fire(f.root);
  assert.equal(event.prevented,true);
  assert.equal(event.stopped,true);
  assert.deepEqual(f.messages,['Root action is not available yet.']);
  f.dispose();
});

test('composed shadow DOM paths intercept inner planned actions even when retargeted', () => {
  const f=fixture();
  const host=node('GC-ACTION',{},f.root);
  const inner=node('BUTTON',{'data-gc-availability':'planned','data-gc-feature':'Private export'},host);
  const event={
    target:host,
    composedPath:()=>[inner,host,f.root],
    prevented:false,stopped:false,
    preventDefault(){this.prevented=true;},
    stopImmediatePropagation(){this.stopped=true;}
  };
  f.handlers.get('click')(event);
  assert.equal(event.prevented,true);
  assert.equal(event.stopped,true);
  assert.deepEqual(f.messages,['Private export is not available yet.']);
  f.dispose();
});
