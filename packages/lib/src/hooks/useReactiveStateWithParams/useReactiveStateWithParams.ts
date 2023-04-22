import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import {
    ReactiveStateRecord,
    ReactiveStateUpdateRequest,
    ReactiveStateUpdateRequestWithField,
    UseReactiveStateRecord
} from './types';
import useBooleanState from '../useBooleanState';
import useMounted from '../useMounted';

// [TODO]: Modify hook to also accept object with initial values
const useReactiveStateWithParams = <V extends any, K extends string = string>(params: K[] = []): UseReactiveStateRecord<V, K> => {
    const $initialState = useRef(Object.freeze(Object.fromEntries(params.map(param => [param])) as ReactiveStateRecord<V, K>));
    const $changedParams = useRef(new Set<K>());
    const $mounted = useMounted();

    const [ defaultState, setDefaultState ] = useState($initialState.current);
    const [ hasDefaultState, updateHasDefaultState ] = useBooleanState(false);
    const [ hasPendingChanges, updateHasPendingChanges ] = useBooleanState(false);
    const [ state, setCurrentState ] = useState(defaultState);

    const canResetState = useMemo(() => !!$changedParams.current.size, [state]);

    const [ resetState, updateState ] = useMemo(() => {
        const requestStateUpdate = (stateUpdateRequest: ReactiveStateUpdateRequest<V, K>) => {
            if (!$mounted.current) return;
            dispatch(latestStateUpdateRequest = stateUpdateRequest);

            Promise.resolve().then(() => {
                if (stateUpdateRequest !== latestStateUpdateRequest) return;
                $mounted.current && updateHasPendingChanges(true);
            });
        };

        let latestStateUpdateRequest: ReactiveStateUpdateRequest<V, K> | null = null;

        return [
            () => requestStateUpdate('reset'),
            (stateUpdateRequest: ReactiveStateUpdateRequestWithField<V, K>) => requestStateUpdate(stateUpdateRequest)
        ];
    }, []);

    const [ STATE, dispatch ] = useReducer(
        (state, stateUpdateRequest: ReactiveStateUpdateRequest<V, K>) => {
            if (stateUpdateRequest === 'reset') {
                $changedParams.current.clear();
                return defaultState;
            }

            let stateUpdated = false;
            const updatedState = {...stateUpdateRequest} as ReactiveStateRecord<V, K>;

            for (const [key, value] of Object.entries<V | undefined>(stateUpdateRequest)) {
                const defaultValue = defaultState[key as K];
                const updateValue = updatedState[key as K] = value || defaultValue;

                hasDefaultState && $changedParams.current[
                    updateValue === defaultValue ? 'delete' : 'add'
                ](key as K);

                if (updateValue !== state[key as K]) stateUpdated = true;
            }

            if (stateUpdated) {
                return hasDefaultState && $changedParams.current.size === 0
                    ? defaultState
                    : Object.freeze({ ...state, ...updatedState });
            }

            return state;
        },
        $initialState.current
    );

    useEffect(() => {
        if (!$mounted.current) return;
        updateHasPendingChanges(false);

        if (!hasPendingChanges || state === STATE) return;
        setCurrentState(STATE);

        if (!hasDefaultState) {
            setDefaultState(STATE);
            updateHasDefaultState(true);
        }
    }, [hasDefaultState, hasPendingChanges, state, STATE]);

    return { canResetState, defaultState, resetState, state, updateState };
};

export default useReactiveStateWithParams;
