var augmentor = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  var curr = null;
  var augmentor = function augmentor(fn) {
    var stack = [];
    return function hook() {
      var prev = curr;
      var after = [];
      curr = {
        hook: hook,
        args: arguments,
        stack: stack,
        i: 0,
        after: after
      };

      try {
        return fn.apply(null, arguments);
      } finally {
        curr = prev;

        for (var i = 0, length = after.length; i < length; i++) {
          after[i]();
        }
      }
    };
  };
  var contextual = function contextual(fn) {
    var context = null;
    var augmented = augmentor(function () {
      return fn.apply(context, arguments);
    });
    return function () {
      context = this;
      return augmented.apply(this, arguments);
    };
  };
  var current = function current() {
    return curr;
  };
  function different(value, i) {
    return value !== this[i];
  }
  var isFunction = function isFunction(fn) {
    return typeof fn === 'function';
  };

  var compat = typeof cancelAnimationFrame === 'function';
  var cAF = compat ? cancelAnimationFrame : clearTimeout;
  var rAF = compat ? requestAnimationFrame : setTimeout;
  function reraf(limit) {
    var force, timer, callback, self, args;
    reset();
    return function reschedule(_callback, _self, _args) {
      callback = _callback;
      self = _self;
      args = _args;
      if (!timer) timer = rAF(invoke);
      if (--force < 0) stop(true);
      return stop;
    };

    function invoke() {
      reset();
      callback.apply(self, args || []);
    }

    function reset() {
      force = limit || Infinity;
      timer = compat ? 0 : null;
    }

    function stop(flush) {
      var didStop = !!timer;

      if (didStop) {
        cAF(timer);
        if (flush) invoke();
      }

      return didStop;
    }
  }

  /*! (c) Andrea Giammarchi - ISC */
  var updates = new WeakMap();

  var update = function update(hook, ctx, args) {
    hook.apply(ctx, args);
  };

  var useState = function useState(value, options) {
    var state = current();
    var i = state.i++;
    var hook = state.hook,
        args = state.args,
        stack = state.stack;

    if (stack.length <= i) {
      stack[i] = isFunction(value) ? value() : value;
      if (!updates.has(hook)) updates.set(hook, options && options.sync ? update : reraf());
    }

    return [stack[i], function (value) {
      stack[i] = isFunction(value) ? value(stack[i]) : value;
      updates.get(hook)(hook, null, args);
    }];
  };

  /*! (c) Andrea Giammarchi - ISC */
  var hooks = new WeakMap();

  var invoke = function invoke(_ref) {
    var hook = _ref.hook,
        args = _ref.args;
    hook.apply(null, args);
  };

  var createContext = function createContext(value) {
    var context = {
      value: value,
      provide: provide
    };
    hooks.set(context, []);
    return context;
  };
  var useContext = function useContext(context) {
    var _current = current(),
        hook = _current.hook,
        args = _current.args;

    var stack = hooks.get(context);
    var info = {
      hook: hook,
      args: args
    };
    if (!stack.some(update$1, info)) stack.push(info);
    return context.value;
  };

  function provide(value) {
    if (this.value !== value) {
      this.value = value;
      hooks.get(this).forEach(invoke);
    }
  }

  function update$1(_ref2) {
    var hook = _ref2.hook;
    return hook === this.hook;
  }

  /*! (c) Andrea Giammarchi - ISC */
  var effects = new WeakMap();

  var stop = function stop() {};

  var createEffect = function createEffect(sync) {
    return function (effect, guards) {
      var state = current();
      var i = state.i++;
      var hook = state.hook,
          stack = state.stack,
          after = state.after;

      if (i < stack.length) {
        var info = stack[i];
        var clean = info.clean,
            update = info.update,
            values = info.values;

        if (!guards || guards.some(different, values)) {
          info.values = guards;

          if (clean) {
            info.clean = null;
            clean();
          }

          var invoke = function invoke() {
            info.clean = effect();
          };

          if (sync) after.push(invoke);else update(invoke);
        }
      } else {
        if (!effects.has(hook)) effects.set(hook, {
          stack: [],
          update: reraf()
        });
        var details = effects.get(hook);
        var _info = {
          clean: null,
          stop: stop,
          update: details.update,
          values: guards
        };
        stack[i] = _info;
        details.stack.push(_info);

        var _invoke = function _invoke() {
          _info.clean = effect();
        };

        if (sync) after.push(_invoke);else _info.stop = details.update(_invoke);
      }
    };
  };

  var useEffect = createEffect(false);
  var useLayoutEffect = createEffect(true);
  var dropEffect = function dropEffect(hook) {
    if (effects.has(hook)) effects.get(hook).stack.forEach(function (info) {
      var clean = info.clean,
          stop = info.stop;
      stop();

      if (clean) {
        info.clean = null;
        clean();
      }
    });
  };

  /*! (c) Andrea Giammarchi - ISC */
  var useMemo = function useMemo(memo, guards) {
    var state = current();
    var i = state.i++;
    var stack = state.stack;
    if (!guards || stack.length <= i || guards.some(different, stack[i].values)) stack[i] = {
      current: memo(),
      values: guards
    };
    return stack[i].current;
  };
  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  };

  /*! (c) Andrea Giammarchi - ISC */
  var useReducer = function useReducer(reducer, value, init, options) {
    var fn = typeof init === 'function'; // avoid `cons [state, update] = ...` Babel destructuring bloat

    var pair = useState(fn ? init(value) : value, fn ? options : init);
    return [pair[0], function (value) {
      pair[1](reducer(pair[0], value));
    }];
  };

  /*! (c) Andrea Giammarchi - ISC */
  var useRef = function useRef(value) {
    var state = current();
    var i = state.i++;
    var stack = state.stack;
    return i < stack.length ? stack[i] : stack[i] = {
      current: value
    };
  };

  exports.augmentor = augmentor;
  exports.contextual = contextual;
  exports.createContext = createContext;
  exports.dropEffect = dropEffect;
  exports.useCallback = useCallback;
  exports.useContext = useContext;
  exports.useEffect = useEffect;
  exports.useLayoutEffect = useLayoutEffect;
  exports.useMemo = useMemo;
  exports.useReducer = useReducer;
  exports.useRef = useRef;
  exports.useState = useState;

  return exports;

}({}));
