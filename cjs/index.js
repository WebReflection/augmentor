'use strict';
/*! (c) Andrea Giammarchi - ISC */

const reraf = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('reraf'));

let state = null;

// main exports
const augmentor = fn => {
  const stack = [];
  return function hook() {
    const prev = state;
    const after = [];
    state = {
      hook, args: arguments,
      stack, i: 0, length: stack.length,
      after
    };
    try { return fn.apply(null, arguments); }
    finally {
      state = prev;
      for (let i = 0, {length} = after; i < length; i++)
        after[i]();
    }
  }
};
exports.augmentor = augmentor;

const contextual = fn => {
  let context = null;
  const augmented = augmentor(function () {
    return fn.apply(context, arguments);
  });
  return function () {
    context = this;
    return augmented.apply(this, arguments);
  };
};
exports.contextual = contextual;

// useState
const updates = new WeakMap;
const setRaf = hook => {
  const update = reraf();
  updates.set(hook, update);
  return update;
};

const hookdate = (hook, ctx, args) => { hook.apply(ctx, args); };
const defaults = {async: false, always: false};

const useState = (value, options) => {
  const {hook, args, stack, i, length} = state;
  const {async: asy, always} = (options || defaults);
  if (i === length)
    state.length = stack.push({
      $: typeof value === 'function' ? value() : value,
      _: asy ? (updates.get(hook) || setRaf(hook)) : hookdate
    });
  const ref = stack[state.i++];
  return [ref.$, value => {
    const $value = typeof value === 'function' ? value(ref.$) : value;
    if (always || (ref.$ !== $value)) {
      ref.$ = $value;
      ref._(hook, null, args);
    }
  }];
};
exports.useState = useState;

// useReducer
const useReducer = (reducer, value, init, options) => {
  const fn = typeof init === 'function';
  // avoid `cons [state, update] = ...` Babel destructuring bloat
  const pair = useState(fn ? init(value) : value, fn ? options : init);
  return [pair[0], value => {
    pair[1](reducer(pair[0], value));
  }];
};
exports.useReducer = useReducer;

// useContext
const hooks = new WeakMap;
const invoke = ({hook, args}) => { hook.apply(null, args); };

const createContext = value => {
  const context = {value, provide};
  hooks.set(context, []);
  return context;
};
exports.createContext = createContext;

const useContext = context => {
  const {hook, args} = state;
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

// useEffect, useLayoutEffect, dropEffect
const effects = new WeakMap;
const stop = () => {};
const setFX = hook => {
  const details = {stack: [], update: reraf()};
  effects.set(hook, details);
  return details;
};

const createEffect = sync => (effect, guards) => {
  const {hook, after, stack, i, length} = state;
  if (i < length) {
    const info = stack[i];
    const {clean, update, values} = info;
    if (!guards || guards.some(different, values)) {
      info.values = guards;
      if (clean) {
        info.clean = null;
        clean();
      }
      const invoke = () => { info.clean = effect(); };
      if (sync)
        after.push(invoke);
      else
        update(invoke);
    }
  }
  else {
    const details = effects.get(hook) || setFX(hook);
    const info = {
      clean: null,
      stop,
      update: details.update,
      values: guards
    };
    state.length = stack.push(info);
    state.i++;
    details.stack.push(info);
    const invoke = () => { info.clean = effect(); };
    if (sync)
      after.push(invoke);
    else
      info.stop = details.update(invoke);
  }
};

const useEffect = createEffect(false);
exports.useEffect = useEffect;
const useLayoutEffect = createEffect(true);
exports.useLayoutEffect = useLayoutEffect;

const dropEffect = hook => {
  const fx = effects.get(hook);
  if (fx)
    fx.stack.forEach(info => {
      const {clean, stop} = info;
      stop();
      if (clean) {
        info.clean = null;
        clean();
      }
    });
};
exports.dropEffect = dropEffect;

const hasEffect = effects.has.bind(effects);
exports.hasEffect = hasEffect;

// useMemo, useCallback
const useMemo = (memo, guards) => {
  const {stack, i, length} = state;
  if (i === length)
    state.length = stack.push({$: memo(), _: guards});
  else if (!guards || guards.some(different, stack[i]._))
    stack[i] = {$: memo(), _: guards};
  return stack[state.i++].$;
};
exports.useMemo = useMemo;

const useCallback = (fn, guards) => useMemo(() => fn, guards);
exports.useCallback = useCallback;

// useRef
const useRef = value => {
  const {stack, i, length} = state;
  if (i === length)
    state.length = stack.push({current: value});
  return stack[state.i++];
};
exports.useRef = useRef;

function different(value, i) {
  return value !== this[i];
}
