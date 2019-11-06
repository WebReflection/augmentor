'use strict';
/*! (c) Andrea Giammarchi - ISC */
const reraf = (require('reraf'));
const {current, getStack} = require('./utils.js');

const states = new WeakMap;
const updateState = reraf();

const useState = value => {
  const {hook, args, index} = current();
  const stack = getStack(states, hook);
  if (stack.length <= index)
    stack[index] = value;
  return [stack[index], value => {
    stack[index] = value;
    updateState(hook, null, args);
  }];
};
exports.useState = useState;
