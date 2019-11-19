/*! (c) Andrea Giammarchi - ISC */

import {useState} from './use-state.js';

export const useReducer = (reducer, value, init, options) => {
  const fn = typeof init === 'function';
  // avoid `cons [state, update] = ...` Babel destructuring bloat
  const pair = useState(fn ? init(value) : value, fn ? options : init);
  return [pair[0], value => {
    pair[1](reducer(pair[0], value));
  }];
};
