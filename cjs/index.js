'use strict';
/*! (c) Andrea Giammarchi - ISC */
(m => {
  exports.augmentor = m.augmentor;
})(require('./utils.js'));
(m => {
  exports.useState = m.useState;
})(require('./use-state.js'));
(m => {
  exports.createContext = m.createContext;
  exports.useContext = m.useContext;
})(require('./use-context.js'));
(m => {
  exports.useEffect = m.useEffect;
  exports.useLayoutEffect = m.useLayoutEffect;
  exports.dropEffect = m.dropEffect;
})(require('./use-effect.js'));
(m => {
  exports.useMemo = m.useMemo;
})(require('./use-memo.js'));
(m => {
  exports.useCallback = m.useCallback;
})(require('./use-callback.js'));
(m => {
  exports.useReducer = m.useReducer;
})(require('./use-reducer.js'));
(m => {
  exports.useRef = m.useRef;
})(require('./use-ref.js'));
