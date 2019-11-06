'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {current, different} = require('./utils.js');

const useMemo = (memo, guards) => {
  const {stack, index} = current();
  if (
    !guards ||
    stack.length <= index ||
    guards.some(different, stack[index].values)
  )
    stack[index] = {current: memo(), values: guards};
  return stack[index].current;
};
exports.useMemo = useMemo;

const useCallback = (fn, guards) => useMemo(() => fn, guards);
exports.useCallback = useCallback;
