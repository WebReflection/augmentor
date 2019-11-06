/*! (c) Andrea Giammarchi - ISC */
import reraf from 'reraf';
import {current, different} from './utils.js';

const effects = new WeakMap;
const stop = () => {};

const createEffect = sync => (effect, guards) => {
  const {hook, stack, index, after} = current();
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
    (effects.get(hook) || effects.set(hook, []).get(hook)).push(info);
    if (sync)
      after.push(invoke);
    else
      info.stop = update(invoke);
  }
};

export const useEffect = createEffect(false);
export const useLayoutEffect = createEffect(true);

export const dropEffect = hook => {
  if (effects.has(hook))
    effects.get(hook).forEach(info => {
      const {clean, stop} = info;
      stop();
      if (clean) {
        info.clean = null;
        clean();
      }
    });
};
