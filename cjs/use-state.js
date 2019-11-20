'use strict';
/*! (c) Andrea Giammarchi - ISC */

const reraf = (require('reraf'));
const {current, isFunction} = require('./utils.js');

const updates = new WeakMap;
const update = (hook, ctx, args) => { hook.apply(ctx, args); };

const useState = (value, options) => {
  const state = current();
  const i = state.i++;
  const {hook, args, stack} = state;
  if (stack.length <= i) {
    stack[i] = isFunction(value) ? value() : value;
    if (!updates.has(hook))
      updates.set(hook, options && options.sync ? update : reraf());
  }
  return [stack[i], value => {
    stack[i] = isFunction(value) ? value(stack[i]) : value;
    updates.get(hook)(hook, null, args);
  }];
};
exports.useState = useState;
