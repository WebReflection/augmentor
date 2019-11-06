'use strict';
/*! (c) Andrea Giammarchi - ISC */

const reraf = (require('reraf'));
const {current} = require('./utils.js');

const updateState = reraf();

const useState = value => {
  const {hook, args, stack, index} = current();
  if (stack.length <= index)
    stack[index] = value;
  return [stack[index], value => {
    stack[index] = value;
    updateState(hook, null, args);
  }];
};
exports.useState = useState;
