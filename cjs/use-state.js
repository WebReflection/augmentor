'use strict';
/*! (c) Andrea Giammarchi - ISC */

const reraf = (require('reraf'));
const {current} = require('./utils.js');

const updates = new WeakMap;

const useState = value => {
  const {hook, args, stack, index} = current();
  if (stack.length <= index) {
    stack[index] = value;
    if (!updates.has(hook))
      updates.set(hook, reraf());
  }
  return [stack[index], value => {
    stack[index] = value;
    updates.get(hook)(hook, null, args);
  }];
};
exports.useState = useState;
