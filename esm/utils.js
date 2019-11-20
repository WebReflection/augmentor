/*! (c) Andrea Giammarchi - ISC */

let curr = null;

export const augmentor = fn => {
  const stack = [];
  return function hook() {
    const prev = curr;
    const after = [];
    curr = {
      hook, args: arguments,
      stack, i: 0,
      after
    };
    try { return fn.apply(null, arguments); }
    finally {
      curr = prev;
      for (let i = 0, {length} = after; i < length; i++)
        after[i]();
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
