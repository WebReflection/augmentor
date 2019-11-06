var augmentor = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  var curr = null;

  var invoke = function invoke(fn) {
    fn();
  };

  var set = function set(wm, hook, stack) {
    return wm.set(hook, stack), stack;
  };

  var current = function current() {
    return curr;
  };
  var augmentor = function augmentor(fn) {
    return function hook() {
      var prev = curr;
      var after = [];
      var i = 0;
      curr = {
        hook: hook,
        after: after,
        args: arguments,

        get index() {
          return i++;
        }

      };

      try {
        return fn.apply(null, arguments);
      } finally {
        curr = prev;
        after.forEach(invoke);
      }
    };
  };
  var getStack = function getStack(wm, hook) {
    return wm.get(hook) || set(wm, hook, []);
  };
  function different(value, i) {
    return value !== this[i];
  }

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
  var states = new WeakMap();
  var updateState = reraf();
  var useState = function useState(value) {
    var _current = current(),
        hook = _current.hook,
        args = _current.args,
        index = _current.index;

    var stack = getStack(states, hook);
    if (stack.length <= index) stack[index] = value;
    return [stack[index], function (value) {
      stack[index] = value;
      updateState(hook, null, args);
    }];
  };

  var hooks = new WeakMap();

  var invoke$1 = function invoke(_ref) {
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
    if (!stack.some(update, info)) stack.push(info);
    return context.value;
  };

  function provide(value) {
    if (this.value !== value) {
      this.value = value;
      hooks.get(this).forEach(invoke$1);
    }
  }

  function update(_ref2) {
    var hook = _ref2.hook;
    return hook === this.hook;
  }

  /*! (c) Andrea Giammarchi - ISC */
  var effects = new WeakMap();

  var stop = function stop() {};

  var createEffect = function createEffect(sync) {
    return function (effect, guards) {
      var _current = current(),
          hook = _current.hook,
          after = _current.after,
          index = _current.index;

      var stack = getStack(effects, hook);

      if (index < stack.length) {
        var info = stack[index];
        var clean = info.clean,
            invoke = info.invoke,
            update = info.update,
            values = info.values;

        if (!guards || guards.some(different, values)) {
          info.values = guards;

          if (clean) {
            info.clean = null;
            clean();
          }

          if (sync) after.push(invoke);else update(invoke);
        }
      } else {
        var _invoke = function _invoke() {
          _info.clean = effect();
        };

        var _update = reraf();

        var _info = {
          clean: null,
          invoke: _invoke,
          stop: stop,
          update: _update,
          values: guards
        };
        stack[index] = _info;
        if (sync) after.push(_invoke);else _info.stop = _update(_invoke);
      }
    };
  };

  var useEffect = createEffect(false);
  var useLayoutEffect = createEffect(true);
  var dropEffect = function dropEffect(hook) {
    getStack(effects, hook).forEach(function (info) {
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
  var memos = new WeakMap();
  var useMemo = function useMemo(memo, guards) {
    var _current = current(),
        hook = _current.hook,
        index = _current.index;

    var stack = getStack(memos, hook);
    if (!guards || stack.length <= index || guards.some(different, stack[index].values)) stack[index] = {
      current: memo(),
      values: guards
    };
    return stack[index].current;
  };

  /*! (c) Andrea Giammarchi - ISC */
  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  };

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var useReducer = function useReducer(reducer, value, init) {
    var _useState = useState(init ? init(value) : value),
        _useState2 = _slicedToArray(_useState, 2),
        state = _useState2[0],
        update = _useState2[1];

    return [state, function (value) {
      update(reducer(state, value));
    }];
  };

  /*! (c) Andrea Giammarchi - ISC */
  var refs = new WeakMap();
  var useRef = function useRef(value) {
    var _current = current(),
        hook = _current.hook,
        index = _current.index;

    var stack = getStack(refs, hook);
    return index < stack.length ? stack[index] : stack[index] = {
      current: value
    };
  };

  exports.augmentor = augmentor;
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
