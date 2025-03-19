import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '../components/types';
import { uniqueId as _uniqueId } from '../utils';

export type TabbedControlOptions = readonly { id: string }[];
export type TabbedControlOptionId<T extends TabbedControlOptions> = T[number] extends { id: infer U } ? U : never;

export interface TabbedControlConfig<T extends TabbedControlOptions> {
    defaultOption?: TabbedControlOptionId<T>;
    options: T;
}

const findDefaultOptionIndex = <T extends TabbedControlOptions>(
    options: TabbedControlConfig<T>['options'],
    defaultOption?: TabbedControlConfig<T>['defaultOption']
) => {
    if (!defaultOption) return 0;
    const defaultOptionIndex = options.findIndex(option => option.id === defaultOption);
    return defaultOptionIndex === -1 ? 0 : defaultOptionIndex;
};

export const useTabbedControl = <T extends TabbedControlOptions>(
    options: TabbedControlConfig<T>['options'],
    defaultOption?: TabbedControlConfig<T>['defaultOption']
) => {
    const [activeIndex, _setActiveIndex] = useState(findDefaultOptionIndex(options, defaultOption));
    const optionElementsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const uniqueId = useRef(_uniqueId().replace(/.*?(?=\d+$)/, '')).current;

    const numberOfOptions = options.length;

    const focusOption = useCallback((index: number) => {
        const optionElement = optionElementsRef.current[index];
        optionElement?.focus();
    }, []);

    const onKeyDown = useMemo(() => {
        const keyMap: Record<KeyboardEvent['key'], () => void> = {
            [InteractionKeyCode.ARROW_LEFT]: () => focusOption((activeIndex - 1 + numberOfOptions) % numberOfOptions),
            [InteractionKeyCode.ARROW_RIGHT]: () => focusOption((activeIndex + 1) % numberOfOptions),
            [InteractionKeyCode.HOME]: () => focusOption(0),
            [InteractionKeyCode.END]: () => focusOption(numberOfOptions - 1),
        };

        return (event: KeyboardEvent) => {
            if (keyMap[event.key]) {
                event.preventDefault();
                keyMap[event.key]?.();
            }
        };
    }, [activeIndex, focusOption, numberOfOptions]);

    const refs = useMemo(() => {
        const refs = [] as ((el: HTMLButtonElement | null) => any)[];
        for (let i = 0; i < numberOfOptions; i++) {
            refs[i] = el => (optionElementsRef.current[i] = el);
        }
        return refs;
    }, [numberOfOptions]);

    const setActiveIndex = useCallback(
        (index: number) => {
            _setActiveIndex(activeIndex => (index >= 0 && index < numberOfOptions && Number.isInteger(index) ? index : activeIndex));
        },
        [numberOfOptions]
    );

    return { activeIndex, setActiveIndex, onKeyDown, refs, uniqueId } as const;
};

export default useTabbedControl;
