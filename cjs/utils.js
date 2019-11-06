'use strict';
let curr = null;

const invoke = fn => { fn(); };
const set = (wm, hook, stack) => (wm.set(hook, stack), stack);

const current = () => curr;
exports.current = current;

const augmentor = fn => function hook() {
  const prev = curr;
  const after = [];
  let i = 0;
  curr = {hook, after, args: arguments, get index() { return i++; }};
  try { return fn.apply(null, arguments); }
  finally {
    curr = prev;
    after.forEach(invoke);
  }
};
exports.augmentor = augmentor;

const getStack = (wm, hook) => wm.get(hook) || set(wm, hook, []);
exports.getStack = getStack;

function different(value, i) {
  return value !== this[i];
}
exports.different = different;
