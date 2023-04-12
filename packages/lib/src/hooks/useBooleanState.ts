import { useCallback, useState } from 'preact/hooks';

const useBooleanState = (initialState: boolean = false) => {
    const [state, setState] = useState(initialState);
    const updateState = useCallback((newState: boolean) => setState(newState), [setState]);
    const toggleState = useCallback(() => setState(state => !state), [setState]);
    return [state, updateState, toggleState] as const;
};

export default useBooleanState;
