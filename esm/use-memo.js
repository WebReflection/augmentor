/*! (c) Andrea Giammarchi - ISC */

import {current, different} from './utils.js';

export const useMemo = (memo, guards) => {
  const {stack, index} = current();
  if (
    !guards ||
    stack.length <= index ||
    guards.some(different, stack[index].values)
  )
    stack[index] = {current: memo(), values: guards};
  return stack[index].current;
};

export const useCallback = (fn, guards) => useMemo(() => fn, guards);
