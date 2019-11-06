'use strict';
const {current} = require('./utils.js');

const hooks = new WeakMap;

const invoke = ({hook, args}) => { hook.apply(null, args); };

const createContext = value => {
  const context = {value, provide};
  hooks.set(context, []);
  return context;
};
exports.createContext = createContext;

const useContext = context => {
  const {hook, args} = current();
  const stack = hooks.get(context);
  const info = {hook, args};
  if (!stack.some(update, info))
    stack.push(info);
  return context.value;
};
exports.useContext = useContext;

function provide(value) {
  if (this.value !== value) {
    this.value = value;
    hooks.get(this).forEach(invoke);
  }
}

function update({hook}) {
  return hook === this.hook;
}
