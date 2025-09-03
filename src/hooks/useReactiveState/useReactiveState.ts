import { useEffect, useMemo, useReducer, useRef } from 'preact/hooks';
import { EMPTY_OBJECT } from '../../utils';
import useMounted from '../useMounted';
import { ReactiveStateRecord, ReactiveStateUpdateRequest, ReactiveStateUpdateRequestWithField, UseReactiveStateRecord } from './types';

const useReactiveState = <Value, Param extends string>(
    params: ReactiveStateRecord<Value, Param> = EMPTY_OBJECT as ReactiveStateRecord<Value, Param>,
    initialStateSameAsDefault = true
): UseReactiveStateRecord<Value, Param> => {
    const $hasDefaultState = useRef(initialStateSameAsDefault);
    const $defaultState = useRef(Object.freeze({ ...params }) as ReactiveStateRecord<Value, Param>);
    const $stateParams = useRef(new Set(Object.keys($defaultState.current) as Param[]));
    const $changedParams = useRef(new Set<Param>());
    const $mounted = useMounted();

    const [resetState, updateState] = useMemo(() => {
        const requestStateUpdate = (stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
            if (!$mounted.current) return;
            dispatch(stateUpdateRequest);
        };

        return [
            () => requestStateUpdate('reset'),
            (stateUpdateRequest: ReactiveStateUpdateRequestWithField<Value, Param>) => requestStateUpdate(stateUpdateRequest),
        ];
    }, [$mounted]);

    const [state, dispatch] = useReducer((state, stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
        if (stateUpdateRequest === 'reset') {
            $changedParams.current.clear();
            return $defaultState.current;
        }

        const stateUpdate = { ...stateUpdateRequest } as ReactiveStateRecord<Value, Param>;
        const stateUpdateFlags = [0];

        (Object.keys(stateUpdate) as Param[]).forEach((key, index) => {
            if (!$stateParams.current.has(key)) return;

            const currentValue = state[key] ?? undefined;
            const defaultValue = $defaultState.current[key] ?? undefined;
            const updateValue = stateUpdate[key] ?? defaultValue;

            if (updateValue === currentValue) return;

            const flagIndex = Math.floor(index / 32);
            const updateFlag = 1 << index % 32;

            stateUpdate[key] = updateValue;
            stateUpdateFlags[flagIndex] = (stateUpdateFlags[flagIndex] ?? 0) | updateFlag;
            $changedParams.current[updateValue === defaultValue ? 'delete' : 'add'](key);
        });

        const STATE = stateUpdateFlags.some(flag => flag)
            ? $hasDefaultState.current && $changedParams.current.size === 0
                ? $defaultState.current
                : Object.freeze({ ...state, ...stateUpdate })
            : state;

        if (!$hasDefaultState.current) {
            // Mark as having default state on the first "non-reset" state update request,
            // whether it results in a state update or not.
            $defaultState.current = STATE;
            $hasDefaultState.current = true;
        }

        return STATE;
    }, $defaultState.current);

    const canResetState = useMemo(() => !!$changedParams.current.size, []);

    useEffect(() => {
        $defaultState.current = Object.freeze({ ...params }) as ReactiveStateRecord<Value, Param>;
        $stateParams.current = new Set(Object.keys($defaultState.current) as Param[]);
        $hasDefaultState.current = initialStateSameAsDefault;
        resetState();
    }, [initialStateSameAsDefault, params, resetState]);
    return { canResetState, defaultState: $defaultState.current, resetState, state, updateState };
};

export default useReactiveState;
