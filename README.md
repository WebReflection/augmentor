# augmentor

[![Build Status](https://travis-ci.com/WebReflection/augmentor.svg?branch=master)](https://travis-ci.com/WebReflection/augmentor) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/augmentor/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/augmentor?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/WebReflection/augmentor.svg)](https://greenkeeper.io/) ![WebReflection status](https://offline.report/status/webreflection.svg)

<sup>**Social Media Photo by [Lucrezia Carnelos](https://unsplash.com/@ciabattespugnose) on [Unsplash](https://unsplash.com/)**</sup>

React like [hooks](https://reactjs.org/docs/hooks-reference.html) for the masses.



## Available Hooks

  * **Basic Hooks**
    * [useState](https://reactjs.org/docs/hooks-reference.html#usestate)
    * [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)
    * [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext), which can be defined via `createContext(value)`
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

## F.A.Q.

<details open>
  <summary>
    <strong>Can I pass a context to an augmented function?</strong>
  </summary>
  <div>
While this library provides a way to use a context, it's somehow a footgun to enable multiple contexts for a single augmented stack, so by default you cannot use <code>augmented.call(ctx)</code> or <code>augmented.apply(ctx, [])</code>, 'cause no context whatsoever is passed along.

If by any chance you've read, and understood, the [related blog post](https://medium.com/@WebReflection/demystifying-hooks-f55ad885609f), you'd realize a single augmented function is indeed not good for prototypes or shared methods, as one context could interfere with any other previous context that used that method before.

```js
// WRONG: this is a very bad idea, as any MyComp instance
//        could potentially interfere with other instances
MyComp.prototype.doThings = augmentor(doThings);

// GOOD: this is how you'd do it 👍
class MyComp {
  constructor() {
    const {doThings} = this;
    // augment a bound method/function per each instance
    this.doThings = augmentor(doThings.bind(this));
  }
  doThings() {
    // where actually you do hooky-things
  }
}
```

That being said, if you *really* want to share a context within a single augmented function, meaning that you understand, and know, what you are doing, you can
 use the <code>contextual</code> utility provided by this library.

```js
import {contextual} from 'augmentor';

const textInjector = contextual(function (text) {
  this.textContent = text;
});

textInjector.call(div, 'hello');
textInjector.call(p, 'there!');
```

Please bear in mind that _contextualized_ functions effects will also refer to the previous context, not necessarily the current one, so that you see it's very easy to create troubles sharing, accepting, or passing, multiple contexts to the same augmented stack.

As summary, <code>augmentor(method.bind(context))</code> is the best way to use a context within an augmented function, but <code>contextual</code> can help covering other weird edge cases too.
  </div>
</details> 
