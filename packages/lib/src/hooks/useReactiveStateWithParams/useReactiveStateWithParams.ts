import { useMemo, useReducer, useRef, useState } from 'preact/hooks';
import useMounted from '../useMounted';
import { ReactiveStateRecord, ReactiveStateUpdateRequest, ReactiveStateUpdateRequestWithField, UseReactiveStateRecord } from './types';

// [TODO]: Modify hook to also accept object with initial values
const useReactiveStateWithParams = <Value, Param extends string>(
    params: Partial<Record<Param, any>>[] = [] as any,
    initialStateSameAsDefault = true
): UseReactiveStateRecord<Value, Param> => {
    const $state = useRef(Object.freeze(params.reduce((prev, curr) => ({ ...prev, ...curr }))) as ReactiveStateRecord<Value, Param>);
    const $hasDefaultState = useRef(initialStateSameAsDefault);
    const $markedAsHavingDefaultState = useRef(initialStateSameAsDefault);
    const $changedParams = useRef(new Set<Param>());
    const $stateVersion = useRef(0);
    const $mounted = useMounted();

    const [defaultState, setDefaultState] = useState($state.current);

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

    const [state, dispatch] = useReducer((state, stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
        if (stateUpdateRequest === 'reset') {
            $changedParams.current.clear();
            return defaultState;
        }

        const stateUpdate = { ...stateUpdateRequest } as ReactiveStateRecord<Value, Param>;
        const stateUpdateFlags = [0];

        Object.entries<Value | undefined>(stateUpdate).forEach(([key, value], index) => {
            const currentValue = state[key as Param];
            const updateValue = value ?? undefined;

            if (updateValue !== currentValue) {
                const flagIndex = Math.floor(index / 31);
                const updateFlag = 1 << index % 31;

                if ((stateUpdateFlags[flagIndex] |= updateFlag) && !$hasDefaultState.current) return;

                const defaultValue = defaultState[key as Param];
                const resetsToDefaultValue = (stateUpdate[key as Param] = updateValue ?? defaultValue) === defaultValue;

                if (resetsToDefaultValue && currentValue === defaultValue) {
                    stateUpdateFlags[flagIndex] &= ~updateFlag;
                }

                $changedParams.current[resetsToDefaultValue ? 'delete' : 'add'](key as Param);
            }
        });

        const STATE = stateUpdateFlags.some(flag => flag)
            ? $hasDefaultState.current && $changedParams.current.size === 0
                ? defaultState
                : Object.freeze({ ...state, ...stateUpdate })
            : state;

        if (!$hasDefaultState.current) {
            // Mark as having default state on the first "non-reset" state update request,
            // whether it results in a state update or not.
            setDefaultState(STATE);
            $markedAsHavingDefaultState.current = true;

            // Queue a microtask to update $hasDefaultState,
            // giving just enough time to recompute state version before the update.
            Promise.resolve().then(() => {
                $hasDefaultState.current = true;
            });
        }

        return STATE;
    }, $state.current);

    const canResetState = useMemo(() => !!$changedParams.current.size, [state]);

    const stateVersion = useMemo(() => {
        if (!$hasDefaultState.current && $markedAsHavingDefaultState.current) {
            $hasDefaultState.current = true;
            // State version remains the same since default state should ideally be the initial state.
            return $stateVersion.current;
        }

        return $state.current !== state && ($state.current = state) ? ++$stateVersion.current : $stateVersion.current;
    }, [state]);

    return { canResetState, defaultState, resetState, state, stateVersion, updateState };
};

export default useReactiveStateWithParams;
