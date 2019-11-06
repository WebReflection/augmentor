/*! (c) Andrea Giammarchi - ISC */

import reraf from 'reraf';
import {current} from './utils.js';

const updateState = reraf();

export const useState = value => {
  const {hook, args, stack, index} = current();
  if (stack.length <= index)
    stack[index] = value;
  return [stack[index], value => {
    stack[index] = value;
    updateState(hook, null, args);
  }];
};
