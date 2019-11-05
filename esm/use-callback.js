import {useMemo} from './use-memo.js';

export const useCallback = (fn, guards) => useMemo(() => fn, guards);
