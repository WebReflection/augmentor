/*! (c) Andrea Giammarchi - ISC */

import {useState} from './use-state.js';

export const useReducer = (reducer, value, init) => {
  const [state, update] = useState(init ? init(value) : value);
  return [state, value => {
    update(reducer(state, value));
  }];
};
