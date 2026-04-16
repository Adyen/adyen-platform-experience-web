import { useEffect, useMemo, useReducer, useRef } from 'preact/hooks';
import { EMPTY_OBJECT } from '@integration-components/utils';
import useMounted from '../useMounted';
import { ReactiveStateRecord, ReactiveStateUpdateRequest, ReactiveStateUpdateRequestWithField, UseReactiveStateRecord } from './types';

const useReactiveState = <Value, Param extends string>(
    params: ReactiveStateRecord<Value, Param> = EMPTY_OBJECT as ReactiveStateRecord<Value, Param>,
    initialStateSameAsDefault = true
): UseReactiveStateRecord<Value, Param> => {
    const initialDefaultState = useMemo(() => Object.freeze({ ...params }) as ReactiveStateRecord<Value, Param>, [params]);
    const $hasDefaultStateRef = useRef(initialStateSameAsDefault);
    const $defaultStateRef = useRef(initialDefaultState);
    const $stateParamsRef = useRef(new Set(Object.keys(initialDefaultState) as Param[]));
    const $changedParamsRef = useRef(new Set<Param>());
    const $mounted = useMounted();

    const [state, dispatch] = useReducer((state, stateUpdateRequest: ReactiveStateUpdateRequest<Value, Param>) => {
        if (stateUpdateRequest === 'reset') {
            $changedParamsRef.current.clear();
            return $defaultStateRef.current;
        }

        const stateUpdate = { ...stateUpdateRequest } as ReactiveStateRecord<Value, Param>;
        const stateUpdateFlags = [0];

        (Object.keys(stateUpdate) as Param[]).forEach((key, index) => {
            if (!$stateParamsRef.current.has(key)) return;

            const currentValue = state[key] ?? undefined;
            const defaultValue = $defaultStateRef.current[key] ?? undefined;
            const updateValue = stateUpdate[key] ?? defaultValue;

            if (updateValue === currentValue) return;

            const flagIndex = Math.floor(index / 32);
            const updateFlag = 1 << index % 32;

            stateUpdate[key] = updateValue;
            stateUpdateFlags[flagIndex] = (stateUpdateFlags[flagIndex] ?? 0) | updateFlag;
            $changedParamsRef.current[updateValue === defaultValue ? 'delete' : 'add'](key);
        });

        const STATE = stateUpdateFlags.some(flag => flag)
            ? $hasDefaultStateRef.current && $changedParamsRef.current.size === 0
                ? $defaultStateRef.current
                : Object.freeze({ ...state, ...stateUpdate })
            : state;

        if (!$hasDefaultStateRef.current) {
            // Mark as having default state on the first "non-reset" state update request,
            // whether it results in a state update or not.
            $defaultStateRef.current = STATE;
            $hasDefaultStateRef.current = true;
        }

        return STATE;
    }, initialDefaultState);

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

    const canResetState = useMemo(() => !!$changedParamsRef.current.size, []);
    // eslint-disable-next-line react-hooks/refs
    const defaultState = $defaultStateRef.current;

    useEffect(() => {
        $defaultStateRef.current = Object.freeze({ ...params }) as ReactiveStateRecord<Value, Param>;
        $stateParamsRef.current = new Set(Object.keys($defaultStateRef.current) as Param[]);
        $hasDefaultStateRef.current = initialStateSameAsDefault;
        resetState();
    }, [initialStateSameAsDefault, params, resetState]);

    return { canResetState, defaultState, resetState, state, updateState };
};

export default useReactiveState;
