# augmentor

[![Build Status](https://travis-ci.com/WebReflection/augmentor.svg?branch=master)](https://travis-ci.com/WebReflection/augmentor) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/augmentor/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/augmentor?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/WebReflection/augmentor.svg)](https://greenkeeper.io/) ![WebReflection status](https://offline.report/status/webreflection.svg)

React like [hooks](https://reactjs.org/docs/hooks-reference.html) for the masses.



## Available Hooks

  * **Basic Hooks**
    * [useState](https://reactjs.org/docs/hooks-reference.html#usestate)
    * [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)
  * **Additional Hooks**
    * [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer)
    * [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback)
    * [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo)
    * [useRef](https://reactjs.org/docs/hooks-reference.html#useref)
    * [useLayoutEffect](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)
  * **Third parts exported utilities**
    * `dropEffect(augmentedCallback)` executes any cleanup left from last `useEffect(...)` invocation



## example

You can test this example [directly on Code Pen](https://codepen.io/WebReflection/pen/zymKBb?editors=0011).

```js
import {augmentor, useState} from 'augmentor';

// augment any function once
const a = augmentor(test);
a();

// ... or many times ...
const [b, c] = [test, test].map(augmentor);
b();
c();

function test() {

  const [count, setCount] = useState(0);

  // log current count value
  console.log(count);

  // will invoke this augmented function each second
  setTimeout(() => setCount(count + 1), 1000);
}
```
