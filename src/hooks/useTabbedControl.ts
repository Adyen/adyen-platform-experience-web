import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '../components/types';
import { uniqueId as _uniqueId } from '../utils';

export type TabbedControlOptions<OptionId extends string> = readonly { id: OptionId }[];

export interface TabbedControlConfig<OptionId extends string, Options extends TabbedControlOptions<OptionId>> {
    onChange?: <ActiveOption extends Options[number]>(activeOption: ActiveOption) => void;
    defaultOption?: OptionId;
    options: Options;
}

const enum TabDirection {
    BACKWARD = -1,
    FORWARD = 1,
}

const findDefaultOptionIndex = <OptionId extends string, Options extends TabbedControlOptions<OptionId>>(
    options: TabbedControlConfig<OptionId, Options>['options'],
    defaultOption?: TabbedControlConfig<OptionId, Options>['defaultOption']
) => {
    if (!defaultOption) return 0;
    const defaultOptionIndex = options.findIndex(option => option.id === defaultOption);
    return defaultOptionIndex === -1 ? 0 : defaultOptionIndex;
};

export const useTabbedControl = <OptionId extends string, Options extends TabbedControlOptions<OptionId>>({
    options,
    defaultOption,
    onChange,
}: TabbedControlConfig<OptionId, Options>) => {
    const [focusPending, setFocusPending] = useState(false);
    const [activeIndex, setActiveIndex] = useState(findDefaultOptionIndex(options, defaultOption));
    const optionElementsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const uniqueId = useRef(_uniqueId().replace(/.*?(?=\d+$)/, '')).current;

    const activeOption: Options[number] = options[activeIndex]!;
    const activeOptionRef = useRef(activeOption);
    const numberOfOptions = options.length;

    const refs = useMemo(() => {
        const refs = [] as ((el: HTMLButtonElement | null) => any)[];
        for (let i = 0; i < numberOfOptions; i++) {
            refs[i] = el => (optionElementsRef.current[i] = el);
        }
        return refs;
    }, [numberOfOptions]);

    const getNearestActiveIndex = useCallback(
        (index: number, direction: TabDirection) => {
            let currentIndex = index;
            do {
                if (currentIndex < 0) currentIndex += numberOfOptions;
                if (currentIndex >= numberOfOptions) currentIndex %= numberOfOptions;
                if (optionElementsRef.current[currentIndex]?.disabled === false) break;
            } while ((currentIndex += direction) !== index);

            return currentIndex;
        },
        [numberOfOptions]
    );

    const onClick = useCallback((event: MouseEvent) => {
        const clickedOptionIndex = optionElementsRef.current.findIndex(elem => elem === event.currentTarget);

        if (optionElementsRef.current[clickedOptionIndex]?.disabled === false) {
            event.preventDefault();
            setActiveIndex(clickedOptionIndex);
        }
    }, []);

    const onKeyDown = useMemo(() => {
        const keyMap: Record<KeyboardEvent['key'], () => void> = {
            [InteractionKeyCode.ARROW_LEFT]: () => setActiveIndex(activeIndex => getNearestActiveIndex(activeIndex - 1, TabDirection.BACKWARD)),
            [InteractionKeyCode.ARROW_RIGHT]: () => setActiveIndex(activeIndex => getNearestActiveIndex(activeIndex + 1, TabDirection.FORWARD)),
            [InteractionKeyCode.HOME]: () => setActiveIndex(getNearestActiveIndex(0, TabDirection.FORWARD)),
            [InteractionKeyCode.END]: () => setActiveIndex(getNearestActiveIndex(numberOfOptions - 1, TabDirection.BACKWARD)),
        };

        return (event: KeyboardEvent) => {
            if (keyMap[event.key]) {
                event.preventDefault();
                keyMap[event.key]?.();
                setFocusPending(true);
            }
        };
    }, [numberOfOptions]);

    useEffect(() => {
        if (focusPending) {
            const optionElement = optionElementsRef.current[activeIndex];
            if (optionElement?.disabled === false) optionElement?.focus();
            setFocusPending(false);
        }
    }, [activeIndex, focusPending]);

    useEffect(() => {
        if (activeOptionRef.current !== activeOption) {
            activeOptionRef.current = activeOption;
            onChange?.(activeOption);
        }
    }, [activeOption, onChange]);

    return { activeIndex, onClick, onKeyDown, refs, uniqueId } as const;
};

export default useTabbedControl;
