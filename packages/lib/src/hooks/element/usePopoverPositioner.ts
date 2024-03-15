import { PopoverContainerPosition, PopoverContainerVariant } from '@src/components/internal/Popover/types';
import getIntersectionObserver from '@src/components/internal/Popover/utils/utils';
import { MutableRef, Ref, useCallback, useEffect, useRef, useState } from 'preact/hooks';
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

    let dimensionX = 0;
    let dimensionY = 0;
    let dimensionZ = 0;
    const currentTarget = targetElement?.current as HTMLElement;

    const targetPosition = currentTarget.getBoundingClientRect();
    const popoverContent = popover?.firstChild as HTMLElement;
    switch (position) {
        case PopoverContainerPosition.BOTTOM:
            dimensionX = targetPosition?.left + offset[0]! + window.scrollX;
            dimensionY = targetPosition?.top + targetPosition?.height + offset[1]! + window.scrollY;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.TOP:
            dimensionX = targetPosition.left + offset[0]! + window.scrollX;
            dimensionY = targetPosition?.top - offset[1]! - targetPosition.height - 6 - popoverContent?.clientHeight / 2 + window.scrollY;
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
    arrowRef?: Ref<HTMLSpanElement> | undefined,
    setToTargetWidth?: boolean,
    ref?: Nullable<Reflexable<Element>>
) => {
    const [initialPosition, setInitialPosition] = useState(true);
    const [isLoading, setIsLoading] = useState(!position);
    const [hasInitialPosition, setHasInitialPosition] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(position ?? PopoverContainerPosition.TOP);

    const observerCallback = useCallback(
        (entry: IntersectionObserverEntry) => {
            if (!initialPosition && hasInitialPosition) {
                if (entry.intersectionRatio !== 1) {
                    switch (currentPosition) {
                        case PopoverContainerPosition.TOP:
                            setHasInitialPosition(false);
                            setIsLoading(false);
                            setCurrentPosition(PopoverContainerPosition.BOTTOM);
                            break;
                        case PopoverContainerPosition.BOTTOM:
                            setHasInitialPosition(false);
                            setIsLoading(false);
                            setCurrentPosition(PopoverContainerPosition.TOP);
                            break;
                        case PopoverContainerPosition.RIGHT:
                            setHasInitialPosition(false);
                            setIsLoading(false);
                            setCurrentPosition(PopoverContainerPosition.LEFT);
                            break;
                        case PopoverContainerPosition.LEFT:
                            setHasInitialPosition(false);
                            setIsLoading(false);
                            setCurrentPosition(PopoverContainerPosition.RIGHT);
                            break;
                    }
                } else {
                    setIsLoading(false);
                }
            }
        },
        [setCurrentPosition, currentPosition, initialPosition, setIsLoading, hasInitialPosition]
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

                    const styleWithWidth = setToTargetWidth
                        ? style + ';min-width:fit-content;;width:' + targetElement.current?.clientWidth + 'px'
                        : style;
                    current.setAttribute('style', `${styleWithWidth}`);

                    if (initialPosition) setInitialPosition(false);

                    if (variant && variant === PopoverContainerVariant.TOOLTIP && arrowRef) {
                        arrowRef.current?.classList?.add(`adyen-fp-tooltip__arrow--${currentPosition}`);
                    }
                }
            },
            [
                offset,
                targetElement,
                currentPosition,
                position,
                variant,
                observerCallback,
                setInitialPosition,
                isLoading,
                initialPosition,
                setToTargetWidth,
            ]
        ),
        ref
    );
};

export default usePopoverPositioner;
