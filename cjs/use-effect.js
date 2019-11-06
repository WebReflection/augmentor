'use strict';
const reraf = (require('reraf'));
const {current, different, getStack} = require('./utils.js');

const effects = new WeakMap;
const stop = () => {};

const createEffect = sync => (effect, guards) => {
  const {hook, after, index} = current();
  const stack = getStack(effects, hook);
  if (index < stack.length) {
    const info = stack[index];
    const {clean, invoke, update, values} = info;
    if (!guards || guards.some(different, values)) {
      info.values = guards;
      if (clean) {
        info.clean = null;
        clean();
      }
      if (sync)
        after.push(invoke);
      else
        update(invoke);
    }
  }
  else {
    const invoke = () => { info.clean = effect(); };
    const update = reraf();
    const info = {
      clean: null,
      invoke,
      stop,
      update,
      values: guards
    };
    stack[index] = info;
    if (sync)
      after.push(invoke);
    else
      info.stop = update(invoke);
  }
};

const useEffect = createEffect(false);
exports.useEffect = useEffect;
const useLayoutEffect = createEffect(true);
exports.useLayoutEffect = useLayoutEffect;

const dropEffect = hook => {
  getStack(effects, hook).forEach(info => {
    const {clean, stop} = info;
    stop();
    if (clean) {
      info.clean = null;
      clean();
    }
  });
};
exports.dropEffect = dropEffect;
