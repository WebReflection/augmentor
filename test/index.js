const {
  augmentor,
  contextual,
  useState,
  useEffect,
  useContext, createContext,
  useLayoutEffect,
  dropEffect, hasEffect,
  useCallback,
  useReducer,
  useRef
} = require('../cjs');

console.time('augmentor');

dropEffect(Object);

let context = null;
const rando = {};
contextual(function () {
  context = this;
}).call(rando);

console.assert(context === rando);

let fi = 0;
const f = augmentor(() => useEffect(() => { fi++; }));
f();
f();
f();
console.assert(fi === 2, 'effect is force-triggered');
setTimeout(() => {
  console.assert(fi === 3, 'last effect also triggered');
}, 20);

const State = augmentor((value, ref) => {
  const [count, setCount] = useState(value);
  // for coverage purpose
  const [one, setOne] = useState(() => 1);
  ref.count = count;
  ref.increment = () => setCount(() => count + 1);
  ref.decrement = () => setCount(count - 1);
  ref.reset = () => setCount(value);
  setOne(1);
  return ref;
});

const testCounter = State(0, {});
console.assert(testCounter.count === 0, 'State(0, {})');
testCounter.increment();
testCounter.decrement();
testCounter.increment();
console.assert(testCounter.count === 1, 'testCounter.methods()');
testCounter.reset();
setTimeout(() => {
  console.assert(testCounter.count === 0, 'testCounter.reset()');

  const Reducer = augmentor((value, reducer, ref) => {
    const [state, setState] = useReducer(value, reducer, {async: true});
    ref.state = state;
    ref.increment = () => setState(state + 1);
    return ref;
  });

  const reducer = Reducer((state, value) => value, 0, {});
  reducer.increment();
  setTimeout(() => {
    console.assert(reducer.state === 1, 'reducer.increment()');
    const init = Number;
    const ReducerInit = augmentor((value, reducer, ref) => {
      const [state, setState] = useReducer(value, reducer, init);
      ref.state = state;
      ref.increment = () => setState(state + 1);
      return ref;
    });
    const reducerInit = ReducerInit((state, value) => value, 0, {});
    console.assert(reducerInit.state === 0, 'useReducer init');
    reducerInit.increment();
    setTimeout(() => {
      console.assert(reducerInit.state === 1, 'reducerInit.increment()');
    }, 10);
  }, 10);
}, 10);

const Ref = augmentor(() => {
  return useRef({}).current;
});

console.assert(Ref() === Ref(), 'useRef');

const Callback = augmentor(() => {
  return useCallback(() => {});
});

console.assert(Callback() !== Callback(), 'useCallback');

const SameCallback = augmentor(() => {
  return useCallback(() => {}, []);
});

console.assert(SameCallback() === SameCallback(), 'useCallback []');

let effect = 0;
const Effect = augmentor(() => {
  useEffect(() => {
    effect++;
  });
});

Effect();
setTimeout(() => {
  Effect();
  setTimeout(() => {
    console.assert(effect === 2, 'useEffect');
    const SameEffect = augmentor(() => {
      useEffect(() => {
        effect++;
      }, [1]);
    });
    SameEffect();
    SameEffect();
    setTimeout(() => {
      SameEffect();
      setTimeout(() => {
        console.assert(effect === 3, 'useEffect');
        dropEffect(SameEffect);
        const CleanEffect = augmentor(() => {
          useEffect(() => { /* testing multiple effects */ });
          useEffect(() => {
            effect++;
            return () => { effect--; };
          });
        });
        CleanEffect();
        CleanEffect();
        setTimeout(() => {
          console.assert(effect === 4, 'useEffect => clean');
          CleanEffect();
          CleanEffect();
          setTimeout(() => {
            console.assert(effect === 4, 'useEffect => no drop clean');
            console.assert(hasEffect(CleanEffect), 'hasEffect => was present');
            dropEffect(CleanEffect);
            console.assert(effect === 3, 'useEffect => dropped clean');
            const LayoutEffect = augmentor(() => {
              useLayoutEffect(() => {
                effect++;
              });
            });
            LayoutEffect();
            console.assert(effect === 4, 'useLayoutEffect');
            LayoutEffect();
            console.assert(effect === 5, 'useLayoutEffect');
            dropEffect(LayoutEffect);
            let calls = 0;
            let num = Math.random();
            const context = createContext(num);
            const Context = augmentor(() => {
              calls++;
              return useContext(context);
            });
            console.assert(Context() === num, 'useContext value');
            console.assert(calls === 1, '1 call');
            context.provide(++num);
            console.assert(calls === 2, '1 call + one provide()');
            console.assert(Context() === num, 'useContext provide');
            console.assert(calls === 3, '2 calls + one provide()');
            context.provide(num);
            console.assert(calls === 3, 'no calls with same provided value');
            console.timeEnd('augmentor');
            let ctxCall = false;
            let f = contextual(() => {
              useEffect(() => {
                return () => {
                  ctxCall = true;
                };
              });
            });
            f();
            dropEffect(f);
            f();
            dropEffect(f);
            console.assert(ctxCall === true, 'contextual can be dropped too');
          }, 10);
        }, 10);
      }, 10);
    }, 10);
  }, 10);
}, 10);
