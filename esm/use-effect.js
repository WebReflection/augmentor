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
    if (!effects.has(hook))
      effects.set(hook, {stack: [], update: reraf()});
    const details = effects.get(hook);
    const info = {
      clean: null,
      invoke,
      stop,
      update: details.update,
      values: guards
    };
    stack[index] = info;
    details.stack.push(info);
    if (sync)
      after.push(invoke);
    else
      info.stop = details.update(invoke);
  }
};

export const useEffect = createEffect(false);
export const useLayoutEffect = createEffect(true);

export const dropEffect = hook => {
  if (effects.has(hook))
    effects.get(hook).stack.forEach(info => {
      const {clean, stop} = info;
      stop();
      if (clean) {
        info.clean = null;
        clean();
      }
    });
};
