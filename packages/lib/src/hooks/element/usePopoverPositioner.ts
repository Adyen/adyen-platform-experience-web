import { PopoverContainerPosition, PopoverContainerVariant } from '@src/components/internal/Popover/types';
import getIntersectionObserver from '@src/components/internal/Popover/utils/utils';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import useReflex, { Nullable, Reflexable } from '../useReflex';

const calculateOffset = (
    popover: Element | null,
    offset: number[],
    targetElement: MutableRef<Element | null>,
    position?: PopoverContainerPosition
) => {
    if (offset.length < 3) {
        const oldLength = offset.length;
        offset.length = 3;
        offset.fill(0, oldLength, 3);
    }

    if (!position) {
        position = PopoverContainerPosition.BOTTOM;
    }
    let dimensionX = 0;
    let dimensionY = 0;
    let dimensionZ = 0;
    const currentTarget = targetElement?.current as HTMLElement;
    switch (position) {
        case PopoverContainerPosition.BOTTOM:
            dimensionX = currentTarget?.offsetLeft + offset[0]!;
            dimensionY = currentTarget?.offsetTop + currentTarget?.offsetHeight + offset[1]!;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.TOP:
            dimensionX = currentTarget?.offsetLeft + offset[0]!;
            dimensionY = popover?.clientHeight ? currentTarget?.offsetTop - offset[1]! - popover?.clientHeight : currentTarget?.offsetTop;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.RIGHT:
            dimensionX = currentTarget?.offsetLeft + currentTarget?.offsetWidth + offset[0]!;
            dimensionY = currentTarget?.offsetTop + offset[1]!;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.LEFT:
            dimensionX = popover?.clientWidth ? currentTarget?.offsetLeft - popover?.clientWidth - offset[0]! : 0;
            dimensionY = currentTarget?.offsetTop + offset[1]!;
            dimensionZ = offset[2]!;
            break;
    }

    const result = [dimensionX, dimensionY, dimensionZ];

    const res = result.reduce((acc, currentVal, index) => {
        if (index === 0) {
            return acc + `${currentVal}px,`;
        } else if (index === offset.length - 1) {
            return acc + ` ${currentVal}px)`;
        } else {
            return acc + ` ${currentVal}px,`;
        }
    }, 'translate3d(');

    return `position:absolute;inset:0 auto auto 0;margin: 0;z-index:10;transform: ${res};visibility:hidden`;
};
const usePopoverPositioner = (
    offset: number[],
    targetElement: MutableRef<Element | null>,
    variant: PopoverContainerVariant,
    position?: PopoverContainerPosition,
    ref?: Nullable<Reflexable<Element>>
) => {
    const [initialPosition, setInitialPosition] = useState(true);
    const [isLoading, setIsLoading] = useState(!position);
    const [currentPosition, setCurrentPosition] = useState(position ?? PopoverContainerPosition.TOP);

    const observerCallback = useCallback(
        (entry: IntersectionObserverEntry) => {
            if (!initialPosition) {
                if (entry.intersectionRatio !== 1) {
                    switch (currentPosition) {
                        case PopoverContainerPosition.TOP:
                            setCurrentPosition(PopoverContainerPosition.BOTTOM);
                            break;
                        case PopoverContainerPosition.BOTTOM:
                            setCurrentPosition(PopoverContainerPosition.RIGHT);
                            break;
                        case PopoverContainerPosition.RIGHT:
                            setCurrentPosition(PopoverContainerPosition.LEFT);
                            break;
                        case PopoverContainerPosition.LEFT:
                            break;
                    }
                } else {
                    setIsLoading(false);
                }
            }
        },
        [setCurrentPosition, currentPosition, initialPosition, setIsLoading]
    );
    const observerCallbackRef = useRef(observerCallback);

    useEffect(() => {
        getIntersectionObserver(observerCallbackRef.current).remove();
        observerCallbackRef.current = observerCallback;
    }, [observerCallback]);

    return useReflex<Element>(
        useCallback(
            (current, previous) => {
                if (previous && !position) {
                    const observer = getIntersectionObserver(observerCallback).observer;
                    observer.unobserve(previous);
                }

                if (current) {
                    if (!position) {
                        const observer = getIntersectionObserver(observerCallback).observer;
                        observer.observe(current);
                    }
                    if (!(current instanceof Element)) return;

                    const popoverStyle = calculateOffset(current, offset, targetElement, currentPosition);
                    const style = !isLoading ? popoverStyle + ';visibility:visible' : popoverStyle;
                    current.setAttribute('style', `${style}`);

                    setInitialPosition(false);

                    if (variant && variant === PopoverContainerVariant.TOOLTIP) {
                        current.classList?.add(`popover-content-container--tooltip-${currentPosition}`);
                    }
                }
            },
            [ref, offset, targetElement, currentPosition, position, variant, observerCallback, setInitialPosition, isLoading]
        ),
        ref
    );
};

export default usePopoverPositioner;
