'use strict';
const {useState} = require('./use-state.js');

const useReducer = (reducer, value, init) => {
  const [state, update] = useState(init ? init(value) : value);
  return [state, value => {
    update(reducer(value));
  }];
};
exports.useReducer = useReducer;
