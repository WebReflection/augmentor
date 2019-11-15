'use strict';
/*! (c) Andrea Giammarchi - ISC */

let curr = null;
const invoke = fn => { fn(); };

const augmentor = fn => {
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
exports.augmentor = augmentor;

const contextual = fn => {
  let context = null;
  const augmented = augmentor(function () {
    return fn.apply(context, arguments);
  });
  return function () {
    context = this;
    try { return augmented.apply(this, arguments); }
    finally { context = null; }
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
