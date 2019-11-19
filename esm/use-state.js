/*! (c) Andrea Giammarchi - ISC */

import reraf from 'reraf';
import {current, isFunction} from './utils.js';

const updates = new WeakMap;
const update = (hook, ctx, args) => { hook.apply(ctx, args); };

export const useState = (value, options) => {
  const {hook, args, stack, index} = current();
  if (stack.length <= index) {
    stack[index] = isFunction(value) ? value() : value;
    if (!updates.has(hook))
      updates.set(hook, options && options.sync ? update : reraf());
  }
  return [stack[index], value => {
    stack[index] = isFunction(value) ? value(stack[index]) : value;
    updates.get(hook)(hook, null, args);
  }];
};
