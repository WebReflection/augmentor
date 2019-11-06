/*! (c) Andrea Giammarchi - ISC */

import {useState} from './use-state.js';

export const useReducer = (reducer, value, init) => {
  // avoid Babel destructuring bloat
  const pair = useState(init ? init(value) : value);
  return [pair[0], value => {
    pair[1](reducer(pair[0], value));
  }];
};
