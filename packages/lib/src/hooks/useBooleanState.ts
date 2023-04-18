import { useCallback, useState } from 'preact/hooks';

const useBooleanState = (initialState = false) => {
    const [state, setState] = useState(initialState);
    const updateState = useCallback((state: boolean) => setState(state), [setState]);
    const toggleState = useCallback(() => setState(state => !state), [setState]);
    return [state, updateState, toggleState] as const;
};

export default useBooleanState;
