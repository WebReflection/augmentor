'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {useMemo} = require('./use-memo.js');

const useCallback = (fn, guards) => useMemo(() => fn, guards);
exports.useCallback = useCallback;
