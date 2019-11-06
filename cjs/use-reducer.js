'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {useState} = require('./use-state.js');

const useReducer = (reducer, value, init) => {
  // avoid Babel destructuring bloat
  const pair = useState(init ? init(value) : value);
  return [pair[0], value => {
    pair[1](reducer(pair[0], value));
  }];
};
exports.useReducer = useReducer;
