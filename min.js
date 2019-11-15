/*! (c) Andrea Giammarchi - ISC */
var augmentor=function(n){"use strict";function o(n){n()}function u(r){var a=[];return function n(){var t=c,e=[],u=0;c={hook:n,args:arguments,stack:a,get index(){return u++},after:e};try{return r.apply(null,arguments)}finally{c=t,e.forEach(o)}}}function g(){return c}var c=null;function m(n,t){return n!==this[t]}function i(n){return"function"==typeof n}var e="function"==typeof cancelAnimationFrame,f=e?cancelAnimationFrame:clearTimeout,s=e?requestAnimationFrame:setTimeout;function d(n){var u,r,a,o,c;return t(),function(n,t,e){return a=n,o=t,c=e,r=r||s(i),--u<0&&l(!0),l};function i(){t(),a.apply(o,c||[])}function t(){u=n||1/0,r=e?0:null}function l(n){var t=!!r;return t&&(f(r),n&&i()),t}}function r(n){var t=g(),e=t.hook,u=t.args,r=t.stack,a=t.index;return r.length<=a&&(r[a]=i(n)?n():n,l.has(e)||l.set(e,d())),[r[a],function(n){r[a]=i(n)?n(r[a]):n,l.get(e)(e,null,u)}]}function t(n){var t=n.hook,e=n.args;t.apply(null,e)}var l=new WeakMap,v=new WeakMap;function a(n){this.value!==n&&(this.value=n,v.get(this).forEach(t))}function h(n){return n.hook===this.hook}function y(){}function p(k){return function(n,t){var e=g(),u=e.hook,r=e.stack,a=e.index,o=e.after;if(a<r.length){var c=r[a],i=c.clean,l=c.update,f=c.values;if(!t||t.some(m,f)){c.values=t,i&&(c.clean=null,i());var s=function(){c.clean=n()};k?o.push(s):l(s)}}else{x.has(u)||x.set(u,{stack:[],update:d()});var v=x.get(u),h={clean:null,stop:y,update:v.update,values:t};r[a]=h,v.stack.push(h);var p=function(){h.clean=n()};k?o.push(p):h.stop=v.update(p)}}}function k(n,t){var e=g(),u=e.stack,r=e.index;return(!t||u.length<=r||t.some(m,u[r].values))&&(u[r]={current:n(),values:t}),u[r].current}var x=new WeakMap,E=p(!1),M=p(!0);return n.augmentor=u,n.contextual=function(n){var t=null,e=u(function(){return n.apply(t,arguments)});return function(){t=this;try{return e.apply(this,arguments)}finally{t=null}}},n.createContext=function(n){var t={value:n,provide:a};return v.set(t,[]),t},n.dropEffect=function(n){x.has(n)&&x.get(n).stack.forEach(function(n){var t=n.clean;(0,n.stop)(),t&&(n.clean=null,t())})},n.useCallback=function(n,t){return k(function(){return n},t)},n.useContext=function(n){var t=g(),e=t.hook,u=t.args,r=v.get(n),a={hook:e,args:u};return r.some(h,a)||r.push(a),n.value},n.useEffect=E,n.useLayoutEffect=M,n.useMemo=k,n.useReducer=function(t,n,e){var u=r(e?e(n):n);return[u[0],function(n){u[1](t(u[0],n))}]},n.useRef=function(n){var t=g(),e=t.stack,u=t.index;return u<e.length?e[u]:e[u]={current:n}},n.useState=r,n}({});
