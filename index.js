var augmentor = (function (exports) {
  'use strict';

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
  var state = null; // main exports

  var augmentor = function augmentor(fn) {
    var stack = [];
    return function hook() {
      var prev = state;
      var after = [];
      state = {
        hook: hook,
        args: arguments,
        stack: stack,
        i: 0,
        length: stack.length,
        after: after
      };

      try {
        return fn.apply(null, arguments);
      } finally {
        state = prev;

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
  }; // useState

  var updates = new WeakMap();

  var setRaf = function setRaf(hook) {
    var update = reraf();
    updates.set(hook, update);
    return update;
  };

  var hookdate = function hookdate(hook, ctx, args) {
    hook.apply(ctx, args);
  };

  var defaults = {
    async: false,
    always: false
  };
  var useState = function useState(value, options) {
    var _state = state,
        hook = _state.hook,
        args = _state.args,
        stack = _state.stack,
        i = _state.i,
        length = _state.length;

    var _ref = options || defaults,
        asy = _ref.async,
        always = _ref.always;

    if (i === length) state.length = stack.push({
      $: typeof value === 'function' ? value() : value,
      _: asy ? updates.get(hook) || setRaf(hook) : hookdate
    });
    var ref = stack[state.i++];
    return [ref.$, function (value) {
      var $value = typeof value === 'function' ? value(ref.$) : value;

      if (always || ref.$ !== $value) {
        ref.$ = $value;

        ref._(hook, null, args);
      }
    }];
  }; // useReducer

  var useReducer = function useReducer(reducer, value, init, options) {
    var fn = typeof init === 'function'; // avoid `cons [state, update] = ...` Babel destructuring bloat

    var pair = useState(fn ? init(value) : value, fn ? options : init);
    return [pair[0], function (value) {
      pair[1](reducer(pair[0], value));
    }];
  }; // useContext

  var hooks = new WeakMap();

  var invoke = function invoke(_ref2) {
    var hook = _ref2.hook,
        args = _ref2.args;
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
    var _state2 = state,
        hook = _state2.hook,
        args = _state2.args;
    var stack = hooks.get(context);
    var info = {
      hook: hook,
      args: args
    };
    if (!stack.some(update, info)) stack.push(info);
    return context.value;
  };

  function provide(value) {
    if (this.value !== value) {
      this.value = value;
      hooks.get(this).forEach(invoke);
    }
  }

  function update(_ref3) {
    var hook = _ref3.hook;
    return hook === this.hook;
  } // useEffect, useLayoutEffect, dropEffect


  var effects = new WeakMap();

  var stop = function stop() {};

  var setFX = function setFX(hook) {
    var details = {
      stack: [],
      update: reraf()
    };
    effects.set(hook, details);
    return details;
  };

  var createEffect = function createEffect(sync) {
    return function (effect, guards) {
      var _state3 = state,
          hook = _state3.hook,
          after = _state3.after,
          stack = _state3.stack,
          i = _state3.i,
          length = _state3.length;

      if (i < length) {
        var info = stack[i];
        var clean = info.clean,
            _update = info.update,
            values = info.values;

        if (!guards || guards.some(different, values)) {
          info.values = guards;

          if (clean) {
            info.clean = null;
            clean();
          }

          var _invoke = function _invoke() {
            info.clean = effect();
          };

          if (sync) after.push(_invoke);else _update(_invoke);
        }
      } else {
        var details = effects.get(hook) || setFX(hook);
        var _info = {
          clean: null,
          stop: stop,
          update: details.update,
          values: guards
        };
        state.length = stack.push(_info);
        state.i++;
        details.stack.push(_info);

        var _invoke2 = function _invoke2() {
          _info.clean = effect();
        };

        if (sync) after.push(_invoke2);else _info.stop = details.update(_invoke2);
      }
    };
  };

  var useEffect = createEffect(false);
  var useLayoutEffect = createEffect(true);
  var dropEffect = function dropEffect(hook) {
    var fx = effects.get(hook);
    if (fx) fx.stack.forEach(function (info) {
      var clean = info.clean,
          stop = info.stop;
      stop();

      if (clean) {
        info.clean = null;
        clean();
      }
    });
  }; // useMemo, useCallback

  var useMemo = function useMemo(memo, guards) {
    var _state4 = state,
        stack = _state4.stack,
        i = _state4.i,
        length = _state4.length;
    if (i === length) state.length = stack.push({
      $: memo(),
      _: guards
    });else if (!guards || guards.some(different, stack[i]._)) stack[i] = {
      $: memo(),
      _: guards
    };
    return stack[state.i++].$;
  };
  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  }; // useRef

  var useRef = function useRef(value) {
    var _state5 = state,
        stack = _state5.stack,
        i = _state5.i,
        length = _state5.length;
    if (i === length) state.length = stack.push({
      current: value
    });
    return stack[state.i++];
  };

  function different(value, i) {
    return value !== this[i];
  }

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
