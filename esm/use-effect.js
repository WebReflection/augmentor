/*! (c) Andrea Giammarchi - ISC */
import reraf from 'reraf';
import {current, different} from './utils.js';

const effects = new WeakMap;
const stop = () => {};

const createEffect = sync => (effect, guards) => {
  const state = current();
  const i = state.i++;
  const {hook, stack, after} = state;
  if (i < stack.length) {
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
    if (!effects.has(hook))
      effects.set(hook, {stack: [], update: reraf()});
    const details = effects.get(hook);
    const info = {
      clean: null,
      stop,
      update: details.update,
      values: guards
    };
    stack[i] = info;
    details.stack.push(info);
    const invoke = () => { info.clean = effect(); };
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
