'use strict';
/*! (c) Andrea Giammarchi - ISC */

const reraf = (require('reraf'));
const {current, isFunction} = require('./utils.js');

const updates = new WeakMap;
const update = (hook, ctx, args) => { hook.apply(ctx, args); };
const defaults = {sync: false, always: false};

const useState = (value, options) => {
  const state = current();
  const i = state.i++;
  const {hook, args, stack} = state;
  const {sync, always} = (options || defaults);
  if (stack.length <= i) {
    stack[i] = isFunction(value) ? value() : value;
    if (!updates.has(hook))
      updates.set(hook, sync ? update : reraf());
  }
  return [stack[i], value => {
    const newValue = isFunction(value) ? value(stack[i]) : value;
    if (always || (stack[i] !== newValue)) {
      stack[i] = newValue;
      updates.get(hook)(hook, null, args);
    }
  }];
};
exports.useState = useState;
