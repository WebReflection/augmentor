'use strict';
/*! (c) Andrea Giammarchi - ISC */

const reraf = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('reraf'));
const umap = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('umap'));

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
  let check = true;
  let context = null;
  const augmented = augmentor(function () {
    return fn.apply(context, arguments);
  });
  return function hook() {
    const result = augmented.apply((context = this), arguments);
    // perform hasEffect check only once
    if (check) {
      check = !check;
      // and copy same Array if any FX was used
      if (hasEffect(augmented))
        effects.set(hook, effects.get(augmented));
    }
    return result;
  };
};
exports.contextual = contextual;

// useReducer
const updates = umap(new WeakMap);
const hookdate = (hook, ctx, args) => { hook.apply(ctx, args); };
const defaults = {async: false, always: false};
const getValue = (value, f) => typeof f == 'function' ? f(value) : f;

const useReducer = (reducer, value, init, options) => {
  const i = state.i++;
  const {hook, args, stack, length} = state;
  if (i === length)
    state.length = stack.push({});
  const ref = stack[i];
  ref.args = args;
  if (i === length) {
    const fn = typeof init === 'function';
    const {async: asy, always} = (fn ? options : init) || options || defaults;
    ref.$ = fn ? init(value) : getValue(void 0, value);
    ref._ = asy ? (updates.get(hook) || updates.set(hook, reraf())) : hookdate;
    ref.f = value => {
      const $value = reducer(ref.$, value);
      if (always || (ref.$ !== $value)) {
        ref.$ = $value;
        ref._(hook, null, ref.args);
      }
    };
  }
  return [ref.$, ref.f];
};
exports.useReducer = useReducer;

// useState
const useState = (value, options) =>
                          useReducer(getValue, value, void 0, options);
exports.useState = useState;

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

// dropEffect, hasEffect, useEffect, useLayoutEffect
const effects = new WeakMap;
const fx = umap(effects);
const stop = () => {};

const createEffect = asy => (effect, guards) => {
  const i = state.i++;
  const {hook, after, stack, length} = state;
  if (i < length) {
    const info = stack[i];
    const {update, values, stop} = info;
    if (!guards || guards.some(different, values)) {
      info.values = guards;
      if (asy)
        stop(asy);
      const {clean} = info;
      if (clean) {
        info.clean = null;
        clean();
      }
      const invoke = () => { info.clean = effect(); };
      if (asy)
        update(invoke);
      else
        after.push(invoke);
    }
  }
  else {
    const update = asy ? reraf() : stop;
    const info = {clean: null, update, values: guards, stop};
    state.length = stack.push(info);
    (fx.get(hook) || fx.set(hook, [])).push(info);
    const invoke = () => { info.clean = effect(); };
    if (asy)
      info.stop = update(invoke);
    else
      after.push(invoke);
  }
};

const dropEffect = hook => {
  (effects.get(hook) || []).forEach(info => {
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

const useEffect = createEffect(true);
exports.useEffect = useEffect;

const useLayoutEffect = createEffect(false);
exports.useLayoutEffect = useLayoutEffect;

// useMemo, useCallback
const useMemo = (memo, guards) => {
  const i = state.i++;
  const {stack, length} = state;
  if (i === length)
    state.length = stack.push({$: memo(), _: guards});
  else if (!guards || guards.some(different, stack[i]._))
    stack[i] = {$: memo(), _: guards};
  return stack[i].$;
};
exports.useMemo = useMemo;

const useCallback = (fn, guards) => useMemo(() => fn, guards);
exports.useCallback = useCallback;

// useRef
const useRef = value => {
  const i = state.i++;
  const {stack, length} = state;
  if (i === length)
    state.length = stack.push({current: value});
  return stack[i];
};
exports.useRef = useRef;

function different(value, i) {
  return value !== this[i];
}
