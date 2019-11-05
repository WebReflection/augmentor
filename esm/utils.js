let curr = null;

const invoke = fn => { fn(); };
const set = (wm, hook, stack) => (wm.set(hook, stack), stack);

export const current = () => curr;

export const augmentor = fn => function hook(...args) {
  const prev = curr;
  const after = [];
  let i = 0;
  curr = {after, args, hook, get index() { return i++; }};
  try { return fn.apply(null, args); }
  finally {
    curr = prev;
    after.forEach(invoke);
  }
};

export const getStack = (wm, hook) => wm.get(hook) || set(wm, hook, []);

export function different(value, i) {
  return value !== this[i];
};
