'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {useState} = require('./use-state.js');

const useReducer = (reducer, value, init, options) => {
  const fn = typeof init === 'function';
  // avoid `cons [state, update] = ...` Babel destructuring bloat
  const pair = useState(fn ? init(value) : value, fn ? options : init);
  return [pair[0], value => {
    pair[1](reducer(pair[0], value));
  }];
};
exports.useReducer = useReducer;
