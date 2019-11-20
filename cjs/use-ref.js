'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {current} = require('./utils.js');

const useRef = value => {
  const state = current();
  const i = state.i++;
  const {stack} = state;
  return i < stack.length ? stack[i] : (stack[i] = {current: value});
};
exports.useRef = useRef;
