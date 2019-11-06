const {
  augmentor,
  useState,
  useEffect,
  useLayoutEffect,
  dropEffect,
  useCallback,
  useReducer,
  useRef
} = require('../cjs');

dropEffect(Object);

const State = augmentor((value, ref) => {
  const [count, setCount] = useState(value);
  ref.count = count;
  ref.increment = () => setCount(count + 1);
  ref.decrement = () => setCount(count - 1);
  ref.reset = () => setCount(value);
  return ref;
});

const testCounter = State(0, {});
console.assert(testCounter.count === 0, 'State(0, {})');
testCounter.increment();
testCounter.decrement();
testCounter.increment();
setTimeout(() => {
  console.assert(testCounter.count === 1, 'testCounter.methods()');
  testCounter.reset();
  setTimeout(() => {
    console.assert(testCounter.count === 0, 'testCounter.reset()');

    const Reducer = augmentor((value, reducer, ref) => {
      const [state, setState] = useReducer(value, reducer);
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
          }, 10);
        }, 10);
      }, 10);
    }, 10);
  }, 10);
}, 10);
