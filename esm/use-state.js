/*! (c) Andrea Giammarchi - ISC */
import reraf from 'reraf';
import {current, getStack} from './utils.js';

const states = new WeakMap;
const updateState = reraf();

export const useState = value => {
  const {hook, args, index} = current();
  const stack = getStack(states, hook);
  if (stack.length <= index)
    stack[index] = value;
  return [stack[index], value => {
    stack[index] = value;
    updateState(hook, null, args);
  }];
};
