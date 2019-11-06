/*! (c) Andrea Giammarchi - ISC */

import {current} from './utils.js';

const hooks = new WeakMap;

const invoke = ({hook, args}) => { hook.apply(null, args); };

export const createContext = value => {
  const context = {value, provide};
  hooks.set(context, []);
  return context;
};

export const useContext = context => {
  const {hook, args} = current();
  const stack = hooks.get(context);
  const info = {hook, args};
  if (!stack.some(update, info))
    stack.push(info);
  return context.value;
};

function provide(value) {
  if (this.value !== value) {
    this.value = value;
    hooks.get(this).forEach(invoke);
  }
}

function update({hook}) {
  return hook === this.hook;
}
