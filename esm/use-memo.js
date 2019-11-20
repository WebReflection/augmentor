/*! (c) Andrea Giammarchi - ISC */

import {current, different} from './utils.js';

export const useMemo = (memo, guards) => {
  const state = current();
  const i = state.i++;
  const {stack} = state;
  if (
    !guards ||
    stack.length <= i ||
    guards.some(different, stack[i].values)
  )
    stack[i] = {current: memo(), values: guards};
  return stack[i].current;
};

export const useCallback = (fn, guards) => useMemo(() => fn, guards);
