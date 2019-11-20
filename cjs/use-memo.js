'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {current, different} = require('./utils.js');

const useMemo = (memo, guards) => {
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
exports.useMemo = useMemo;

const useCallback = (fn, guards) => useMemo(() => fn, guards);
exports.useCallback = useCallback;
