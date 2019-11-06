'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {current} = require('./utils.js');

const useRef = value => {
  const {stack, index} = current();
  return index < stack.length ?
          stack[index] :
          (stack[index] = {current: value});
};
exports.useRef = useRef;
