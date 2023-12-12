import { useCallback, useEffect, useRef } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import useListBoxReducer from './useListBoxReducer';

const useListBoxPrimitives = <T extends any = any>(options: T[], selectedOption?: T) => {
    const [state, dispatch] = useListBoxReducer<T>();
    const cachedOptions = useRef<T[]>();
    const cachedSelectedOption = useRef<T>();
    const ref = useUniqueIdentifier();

    const cursor = useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;

                const index = Number((current as HTMLElement).dataset?.index);
                current.setAttribute('tabindex', '-1');

                if (index === state.index) {
                    (current as HTMLElement)?.focus();
                }
            },
            [state]
        )
    );

    useEffect(() => {
        let $options: readonly T[];
        let uniqueOptions: Set<T>;

        if (options === cachedOptions.current) {
            uniqueOptions = new Set(($options = state.options));
        } else {
            uniqueOptions = new Set((cachedOptions.current = options));
            $options = Object.freeze([...uniqueOptions]);
        }

        if ($options.length === 0) {
            cachedSelectedOption.current = undefined;
            return dispatch({ type: 'RESET' });
        }

        if ($options !== state.options || selectedOption !== cachedSelectedOption.current) {
            selection: {
                if (uniqueOptions.size === uniqueOptions.add(selectedOption as T).size) {
                    cachedSelectedOption.current = selectedOption;
                    break selection;
                } else uniqueOptions.delete(selectedOption as T);

                if (uniqueOptions.size === uniqueOptions.add(state.activeOption as T).size) {
                    cachedSelectedOption.current = state.activeOption;
                    break selection;
                } else uniqueOptions.delete(state.activeOption as T);

                cachedSelectedOption.current = cachedOptions.current[0];
            }

            const index = $options.findIndex(option => option === cachedSelectedOption.current);

            dispatch({
                type: 'PATCH',
                arg: { ...state, index, activeIndex: index, activeOption: $options[index], options: $options },
            });
        }
    }, [dispatch, options, selectedOption, state]);

    return { cursor, dispatch, ref, state } as const;
};

export default useListBoxPrimitives;
