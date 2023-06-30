import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { ReactiveStateRecord, ReactiveStateUpdateRequest, ReactiveStateUpdateRequestWithField, UseReactiveStateRecord } from './types';
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

    const [defaultState, setDefaultState] = useState($initialState.current);
    const [hasDefaultState, updateHasDefaultState] = useBooleanState(initialStateSameAsDefault);
    const [state, setCurrentState] = useState(defaultState);

    const canResetState = useMemo(() => !!$changedParams.current.size, [state]);

    const [resetState, updateState] = useMemo(() => {
        const requestStateUpdate = (stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
            if (!$mounted.current) return;
            dispatch(stateUpdateRequest);
        };

        return [
            () => requestStateUpdate('reset'),
            (stateUpdateRequest: ReactiveStateUpdateRequestWithField<Value, Param>) => requestStateUpdate(stateUpdateRequest),
        ];
    }, []);

    const [STATE, dispatch] = useReducer((state, stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
        if (stateUpdateRequest === 'reset') {
            $changedParams.current.clear();
            return defaultState;
        }

        let stateUpdated = 0;
        const stateUpdate = { ...stateUpdateRequest } as ReactiveStateRecord<Value, Param>;

        Object.entries<Value | undefined>(stateUpdate).forEach(([key, value], index) => {
            const currentValue = state[key as Param];
            const updateValue = value ?? undefined;

            if (updateValue !== currentValue) {
                const updateFlag = 1 << index;

                if ((stateUpdated |= updateFlag) && !hasDefaultState) return;

                const defaultValue = defaultState[key as Param];
                const resetsToDefaultValue = (stateUpdate[key as Param] = updateValue ?? defaultValue) === defaultValue;

                if (resetsToDefaultValue && currentValue === defaultValue) stateUpdated &= ~updateFlag;

                $changedParams.current[resetsToDefaultValue ? 'delete' : 'add'](key as Param);
            }
        });

        return stateUpdated ? Object.freeze({ ...state, ...stateUpdate }) : state;
    }, $initialState.current);

    useEffect(() => {
        if (!$mounted.current) return;
        if (state === STATE) return;

        setCurrentState(STATE);

        if (!hasDefaultState) {
            setDefaultState(STATE);
            updateHasDefaultState(true);
        }
    }, [hasDefaultState, state, STATE]);

    return { canResetState, defaultState, resetState, state, updateState };
};

export default useReactiveStateWithParams;
