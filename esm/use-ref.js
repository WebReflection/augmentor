/*! (c) Andrea Giammarchi - ISC */

import {current} from './utils.js';

export const useRef = value => {
  const {stack, index} = current();
  return index < stack.length ?
          stack[index] :
          (stack[index] = {current: value});
};
