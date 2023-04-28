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
const useReactiveStateWithParams = <Value, Param extends string = string>(
    params: Param[] = [],
    initialStateSameAsDefault = true
): UseReactiveStateRecord<Value, Param> => {
    const $initialState = useRef(Object.freeze(Object.fromEntries(params.map(param => [param])) as ReactiveStateRecord<Value, Param>));
    const $changedParams = useRef(new Set<Param>());
    const $mounted = useMounted();

    const [ defaultState, setDefaultState ] = useState($initialState.current);
    const [ hasDefaultState, updateHasDefaultState ] = useBooleanState(initialStateSameAsDefault);
    const [ hasPendingChanges, updateHasPendingChanges ] = useBooleanState(false);
    const [ state, setCurrentState ] = useState(defaultState);

    const canResetState = useMemo(() => !!$changedParams.current.size, [state]);

    const [ resetState, updateState ] = useMemo(() => {
        const requestStateUpdate = (stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
            if (!$mounted.current) return;
            dispatch(latestStateUpdateRequest = stateUpdateRequest);

            Promise.resolve().then(() => {
                if (stateUpdateRequest !== latestStateUpdateRequest) return;
                $mounted.current && updateHasPendingChanges(true);
            });
        };

        let latestStateUpdateRequest: ReactiveStateUpdateRequest<Value, Param> | null = null;

        return [
            () => requestStateUpdate('reset'),
            (stateUpdateRequest: ReactiveStateUpdateRequestWithField<Value, Param>) => requestStateUpdate(stateUpdateRequest)
        ];
    }, []);

    const [ STATE, dispatch ] = useReducer(
        (state, stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
            if (stateUpdateRequest === 'reset') {
                $changedParams.current.clear();
                return defaultState;
            }

            let stateUpdated = false;
            const updatedState = {...stateUpdateRequest} as ReactiveStateRecord<Value, Param>;

            for (const [key, value] of Object.entries<Value | undefined>(stateUpdateRequest)) {
                const defaultValue = defaultState[key as Param];
                const updateValue = updatedState[key as Param] = value || defaultValue;

                hasDefaultState && $changedParams.current[
                    updateValue === defaultValue ? 'delete' : 'add'
                ](key as Param);

                if (updateValue !== state[key as Param]) stateUpdated = true;
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
