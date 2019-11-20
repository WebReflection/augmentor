/*! (c) Andrea Giammarchi - ISC */

import {current} from './utils.js';

export const useRef = value => {
  const state = current();
  const i = state.i++;
  const {stack} = state;
  return i < stack.length ? stack[i] : (stack[i] = {current: value});
};
