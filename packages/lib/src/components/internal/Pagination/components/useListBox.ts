import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import useBooleanState from '@src/hooks/useBooleanState';
import useReflex from '@src/hooks/useReflex';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { clamp, mod, noop } from '@src/utils/common';
import { focusIsWithin } from '@src/utils/tabbable';

const useListBox = <T extends {}>(options: T[], initialOption?: T) => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [activeOption, setActiveOption] = useState<T>();
    const [expanded, setExpanded] = useBooleanState(false);
    const focusRestorationTarget = useRef<HTMLElement | null>(null);
    const ref = useUniqueIdentifier();

    const cursorRef = useReflex<Element>(
        useCallback((current, previous) => {
            if (previous instanceof Element) previous.removeAttribute('aria-selected');
            if (current instanceof Element) current.setAttribute('aria-selected', 'true');
        }, [])
    );

    const expand = useMemo(() => {
        let next: () => void = noop;
        let prev: () => void = noop;
        let goto: (index: number) => void = noop;

        const modulus = options.length;
        const selectedIndex = options.findIndex(option => option === initialOption);

        if (selectedIndex >= 0 || modulus > 0) {
            const index = Math.max(selectedIndex, 0);
            setActiveOption(options[index]);
            setActiveIndex(index);
        }

        if (modulus > 1) {
            next = () => setActiveIndex(current => mod(current + 1, modulus));
            prev = () => setActiveIndex(current => mod(current - 1, modulus));

            goto = (index: number) =>
                setActiveIndex(current => {
                    const clampedIndex = clamp(0, ~~index, modulus);
                    return clampedIndex === index ? index : current;
                });
        }

        const rootProps = Object.freeze({
            onClickCapture: (evt: Event) => {
                let element: HTMLElement | null = evt.target as HTMLElement;

                while (element && element !== evt.currentTarget) {
                    const index = Number(element.dataset.optionPosition);

                    if (Number.isFinite(index)) {
                        evt.stopPropagation();
                        evt.preventDefault();

                        goto(index);
                        setExpanded(false);
                        focusRestorationTarget.current?.focus();

                        break;
                    }

                    element = element.parentNode as HTMLElement;
                }
            },
            onFocusOutCapture: (evt: FocusEvent) => {
                if (focusIsWithin(ref.current ?? undefined, evt.relatedTarget as Element)) return;
                setExpanded(false);
            },
            onKeyDownCapture: (evt: KeyboardEvent) => {
                switch (evt.code) {
                    case InteractionKeyCode.ARROW_DOWN:
                        next();
                        break;
                    case InteractionKeyCode.ARROW_UP:
                        prev();
                        break;
                    case InteractionKeyCode.ENTER:
                    case InteractionKeyCode.ESCAPE:
                        setExpanded(false);
                        focusRestorationTarget.current?.focus();
                        break;
                    default:
                        return;
                }

                evt.stopPropagation();
                evt.preventDefault();
            },
        });

        return () => {
            focusRestorationTarget.current = document.activeElement as HTMLElement;
            setExpanded(true);
            return rootProps;
        };
    }, [options, initialOption, setActiveIndex, setActiveOption, setExpanded]);

    useEffect(() => {
        if (!expanded) setActiveOption(options[activeIndex]);
    }, [activeIndex, expanded, options, setActiveOption]);

    return { activeOption, expand, expanded, ref };
};

export default useListBox;
