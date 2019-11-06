/*! (c) Andrea Giammarchi - ISC */
import {current, getStack} from './utils.js';

const refs = new WeakMap;

export const useRef = value => {
  const {hook, index} = current();
  const stack = getStack(refs, hook);
  return index < stack.length ?
          stack[index] :
          (stack[index] = {current: value});
};
