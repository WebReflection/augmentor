/*! (c) Andrea Giammarchi - ISC */

let curr = null;
const invoke = fn => { fn(); };

export const augmentor = fn => {
  const stack = [];
  return function hook() {
    const prev = curr;
    const after = [];
    let i = 0;
    curr = {
      hook, args: arguments,
      stack, get index() { return i++; },
      after
    };
    try { return fn.apply(null, arguments); }
    finally {
      curr = prev;
      after.forEach(invoke);
    }
  }
};

export const contextual = fn => {
  let context = null;
  const augmented = augmentor(function () {
    return fn.apply(context, arguments);
  });
  return function () {
    context = this;
    return augmented.apply(this, arguments);
  };
};

export const current = () => curr;

export function different(value, i) {
  return value !== this[i];
};

export const isFunction = fn => typeof fn === 'function';
