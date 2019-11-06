'use strict';
/*! (c) Andrea Giammarchi - ISC */
const {current, getStack} = require('./utils.js');

const refs = new WeakMap;

const useRef = value => {
  const {hook, index} = current();
  const stack = getStack(refs, hook);
  return index < stack.length ?
          stack[index] :
          (stack[index] = {current: value});
};
exports.useRef = useRef;
