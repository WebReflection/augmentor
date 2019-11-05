'use strict';
const {current, different, getStack} = require('./utils.js');

const memos = new WeakMap;

const useMemo = (memo, guards) => {
  const {hook, index} = current();
  const stack = getStack(memos, hook);
  if (
    !guards ||
    stack.length <= index ||
    guards.some(different, stack[index].values)
  )
    stack[index] = {current: memo(), values: guards};
  return stack[index].current;
};
exports.useMemo = useMemo;
