'use strict';
/*! (c) Andrea Giammarchi - ISC */

let curr = null;

const augmentor = fn => {
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
exports.augmentor = augmentor;

const contextual = fn => {
  let context = null;
  const augmented = augmentor(function () {
    return fn.apply(context, arguments);
  });
  return function () {
    context = this;
    return augmented.apply(this, arguments);
  };
};
exports.contextual = contextual;

const current = () => curr;
exports.current = current;

function different(value, i) {
  return value !== this[i];
}
exports.different = different;

const isFunction = fn => typeof fn === 'function';
exports.isFunction = isFunction;
