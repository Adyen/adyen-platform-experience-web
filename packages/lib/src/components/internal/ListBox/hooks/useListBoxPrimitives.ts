import { useCallback, useEffect, useRef } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import useListBoxReducer from './useListBoxReducer';
import { UseListBoxConfig } from '../types';

const useListBoxPrimitives = <T extends any = any>(options: T[], { onCursorOption, onSelection, selectedOption }: UseListBoxConfig<T>) => {
    const cachedOptions = useRef<T[]>();
    const cachedSelectedOption = useRef<T>();
    const ref = useUniqueIdentifier();

    const [state, dispatch] = useListBoxReducer<T>();
    const { activeIndex, activeOption, index, options: stateOptions } = state;

    const cursor = useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;

                const optionIndex = Number((current as HTMLElement).dataset?.index);
                current.setAttribute('tabindex', '-1');

                if (optionIndex === index) {
                    (current as HTMLElement)?.focus();
                }
            },
            [index]
        )
    );

    useEffect(() => {
        if (index >= 0) onCursorOption?.(stateOptions[index] as T, index);
    }, [index]);

    useEffect(() => {
        if (activeIndex >= 0) onSelection?.(activeOption as T, activeIndex);
    }, [activeIndex]);

    useEffect(() => {
        let $options: readonly T[];
        let uniqueOptions: Set<T>;

        if (options === cachedOptions.current) {
            uniqueOptions = new Set(($options = stateOptions));
        } else {
            uniqueOptions = new Set((cachedOptions.current = options));
            $options = Object.freeze([...uniqueOptions]);
        }

        if ($options.length === 0) {
            cachedSelectedOption.current = undefined;
            return dispatch({ type: 'RESET' });
        }

        if ($options !== stateOptions || selectedOption !== cachedSelectedOption.current) {
            selection: {
                if (uniqueOptions.size === uniqueOptions.add(selectedOption as T).size) {
                    cachedSelectedOption.current = selectedOption;
                    break selection;
                } else uniqueOptions.delete(selectedOption as T);

                if (uniqueOptions.size === uniqueOptions.add(activeOption as T).size) {
                    cachedSelectedOption.current = activeOption;
                    break selection;
                } else uniqueOptions.delete(activeOption as T);

                cachedSelectedOption.current = cachedOptions.current[0];
            }

            const index = $options.findIndex(option => option === cachedSelectedOption.current);

            dispatch({
                type: 'PATCH',
                arg: { ...state, index, activeIndex: index, activeOption: $options[index], options: $options },
            });
        }
    }, [activeOption, dispatch, options, selectedOption, stateOptions]);

    return { cursor, dispatch, ref, state } as const;
};

export default useListBoxPrimitives;
