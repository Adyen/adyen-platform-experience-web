import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '../components/types';
import useUniqueId from './useUniqueId';

export type TabbedControlOptions<OptionId extends string> = readonly { id: OptionId; disabled?: boolean }[];

export interface TabbedControlConfig<OptionId extends string, Options extends TabbedControlOptions<OptionId>> {
    onChange?: <ActiveOption extends Options[number]>(activeOption: ActiveOption) => void;
    activeOption?: OptionId;
    options: Options;
}

const enum TabDirection {
    BACKWARD = -1,
    FORWARD = 1,
}

const isDisabledOption = <Option extends { disabled?: boolean } | null>(option?: Option) => option?.disabled === true;

const getNearestActiveOptionIndex = <Options extends readonly ({ disabled?: boolean } | null)[]>(
    options: Options,
    index: number,
    direction: TabDirection
) => {
    const numberOfOptions = options.length;

    if (numberOfOptions) {
        let nearestIndex = index;
        let unvisitedOptions = numberOfOptions;

        while (unvisitedOptions--) {
            while (nearestIndex < 0) nearestIndex += numberOfOptions;
            if (nearestIndex >= numberOfOptions) nearestIndex %= numberOfOptions;
            if (!isDisabledOption(options[nearestIndex])) return nearestIndex;
            nearestIndex += direction;
        }
    }

    return 0;
};

const findActiveOptionIndex = <OptionId extends string, Options extends TabbedControlOptions<OptionId>>(
    options: TabbedControlConfig<OptionId, Options>['options'],
    activeOption?: TabbedControlConfig<OptionId, Options>['activeOption'],
    fallbackActiveOptionIndex = 0
) => {
    if (!activeOption) return fallbackActiveOptionIndex;

    const index = options.findIndex(option => option.id === activeOption);
    const activeOptionIndex = index === -1 ? fallbackActiveOptionIndex : index;
    const nearestActiveOptionIndex = getNearestActiveOptionIndex(options, activeOptionIndex, TabDirection.FORWARD);

    return activeOptionIndex === nearestActiveOptionIndex ? activeOptionIndex : fallbackActiveOptionIndex;
};

export const useTabbedControl = <OptionId extends string, Options extends TabbedControlOptions<OptionId>>({
    options,
    activeOption: activeOptionFromProps,
    onChange,
}: TabbedControlConfig<OptionId, Options>) => {
    const [focusPending, setFocusPending] = useState(false);
    const [activeIndex, setActiveIndex] = useState(findActiveOptionIndex(options, activeOptionFromProps));

    const activeOption: Options[number] = options[activeIndex]!;
    const activeOptionRef = useRef(activeOption);
    const optionElementsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const uniqueId = useUniqueId();

    const refs = useMemo(() => {
        const refs = [] as ((el: HTMLButtonElement | null) => any)[];
        for (let i = 0; i < options.length; i++) {
            refs[i] = el => (optionElementsRef.current[i] = el);
        }
        return refs;
    }, [options]);

    const onClick = useCallback((event: MouseEvent) => {
        const clickedOptionIndex = optionElementsRef.current.findIndex(elem => elem === event.currentTarget);

        if (!isDisabledOption(optionElementsRef.current[clickedOptionIndex])) {
            event.preventDefault();
            setActiveIndex(clickedOptionIndex);
        }
    }, []);

    const onKeyDown = useMemo(() => {
        const keyMap: Record<KeyboardEvent['key'], () => void> = {
            [InteractionKeyCode.ARROW_LEFT]: () =>
                setActiveIndex(activeIndex => getNearestActiveOptionIndex(optionElementsRef.current, activeIndex - 1, TabDirection.BACKWARD)),
            [InteractionKeyCode.ARROW_RIGHT]: () =>
                setActiveIndex(activeIndex => getNearestActiveOptionIndex(optionElementsRef.current, activeIndex + 1, TabDirection.FORWARD)),
            [InteractionKeyCode.HOME]: () => setActiveIndex(getNearestActiveOptionIndex(optionElementsRef.current, 0, TabDirection.FORWARD)),
            [InteractionKeyCode.END]: () => setActiveIndex(getNearestActiveOptionIndex(optionElementsRef.current, -1, TabDirection.BACKWARD)),
        };

        return (event: KeyboardEvent) => {
            if (keyMap[event.key]) {
                event.preventDefault();
                keyMap[event.key]?.();
                setFocusPending(true);
            }
        };
    }, []);

    useEffect(() => {
        setActiveIndex(activeIndex => findActiveOptionIndex(options, activeOptionFromProps, activeIndex));
    }, [options, activeOptionFromProps]);

    useEffect(() => {
        if (focusPending) {
            const optionElement = optionElementsRef.current[activeIndex];
            if (!isDisabledOption(optionElement)) optionElement?.focus();
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
