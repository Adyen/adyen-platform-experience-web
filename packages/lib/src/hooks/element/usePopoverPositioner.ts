import { PopoverContainerPosition, PopoverContainerVariant } from '@src/components/internal/Popover/types';
import getIntersectionObserver from '@src/components/internal/Popover/utils/utils';
import { MutableRef, Ref, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import useReflex, { Nullable, Reflexable } from '../useReflex';

const calculateOffset = ({
    popover,
    offset,
    targetElement,
    position,
    variant,
    fullWidth,
}: {
    popover: Element;
    offset: [number, number, number, number];
    targetElement: MutableRef<Element | null>;
    position: PopoverContainerPosition;
    variant: PopoverContainerVariant;
    fullWidth: boolean;
}) => {
    const currentTarget = targetElement?.current as HTMLElement;

    let dimensionX = 0;
    let dimensionY = 0;
    const targetPosition = currentTarget.getBoundingClientRect();
    const bodyPosition = document.body.getBoundingClientRect();

    const popoverContent = popover?.firstChild as HTMLElement;
    const toCenterFullWidth = bodyPosition.left + bodyPosition.width / 2 - popoverContent.offsetWidth / 2;
    const toCenterX = targetPosition.left + targetPosition.width / 2 - popoverContent.offsetWidth / 2;
    const toCenterY = targetPosition.top + targetPosition.height / 2 - popoverContent.offsetHeight / 2;
    switch (position) {
        case PopoverContainerPosition.BOTTOM:
            dimensionX = fullWidth
                ? toCenterFullWidth
                : variant === PopoverContainerVariant.TOOLTIP
                ? toCenterX + window.scrollX
                : targetPosition?.left + window.scrollX;
            dimensionY = targetPosition?.top + targetPosition?.height + window.scrollY + offset[1];
            break;
        case PopoverContainerPosition.BOTTOM_LEFT:
            dimensionX = targetPosition?.right + window.scrollX - popover.clientWidth;
            dimensionY = targetPosition?.top + targetPosition?.height + window.scrollY + offset[1];
            break;
        case PopoverContainerPosition.TOP:
            dimensionX = variant === PopoverContainerVariant.TOOLTIP ? toCenterX + window.scrollX : targetPosition.left + window.scrollX;
            dimensionY = targetPosition?.top - popoverContent?.clientHeight + window.scrollY - offset[0];
            break;
        case PopoverContainerPosition.RIGHT:
            dimensionX = targetPosition.left + targetPosition.width + window.scrollX + offset[2];
            dimensionY =
                variant === PopoverContainerVariant.TOOLTIP
                    ? toCenterY + window.scrollY
                    : targetPosition?.top - targetPosition?.height / 2 + window.scrollY;
            break;
        case PopoverContainerPosition.LEFT:
            dimensionX = targetPosition?.left - popover?.clientWidth + window.scrollX - offset[3];
            dimensionY =
                variant === PopoverContainerVariant.TOOLTIP
                    ? toCenterY + window.scrollY
                    : targetPosition?.top + window.scrollY - targetPosition?.height / 2;
            break;
    }

    const result = [dimensionX, dimensionY, 0];

    const res = result.reduce((acc, currentVal, index) => {
        if (index === 0) {
            return acc + `${currentVal}px,`;
        } else if (index === result.length - 1) {
            return acc + ` ${currentVal}px)`;
        } else {
            return acc + ` ${currentVal}px,`;
        }
    }, 'translate3d(');

    return `position:absolute;inset:0 auto auto 0;margin: 0;transform: ${res};visibility:hidden`;
};
const usePopoverPositioner = (
    offset: [number, number, number, number],
    targetElement: MutableRef<Element | null>,
    variant: PopoverContainerVariant,
    position?: PopoverContainerPosition,
    arrowRef?: Ref<HTMLSpanElement> | undefined,
    setToTargetWidth?: boolean,
    showOverlay?: boolean,
    fitPosition?: boolean,
    ref?: Nullable<Reflexable<Element>>
) => {
    const [initialPosition, setInitialPosition] = useState(true);
    const [showPopover, setShowPopover] = useState(!!position);
    const [currentPosition, setCurrentPosition] = useState(position || PopoverContainerPosition.TOP);
    const [checkedPositions, setCheckedPosition] = useState<Array<[PopoverContainerPosition, number]>>([]);

    const observerCallback = useCallback(
        (entry: IntersectionObserverEntry) => {
            if (entry.intersectionRatio === 1) return setShowPopover(true);
            if (!initialPosition && entry.intersectionRatio !== 1) {
                if (checkedPositions && checkedPositions.length === 4) {
                    const bestPos = checkedPositions.reduce((res, pos) => {
                        if (pos[1] > res[1]) return pos;
                        return res;
                    }, checkedPositions[0]!);
                    setCurrentPosition(bestPos[0]);
                    setShowPopover(true);
                    return;
                }
                setShowPopover(false);
                switch (currentPosition) {
                    case PopoverContainerPosition.TOP:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.TOP, entry.intersectionRatio]]);
                        setCurrentPosition(PopoverContainerPosition.BOTTOM);
                        break;
                    case PopoverContainerPosition.BOTTOM:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.BOTTOM, entry.intersectionRatio]]);
                        setCurrentPosition(fitPosition ? PopoverContainerPosition.BOTTOM_LEFT : PopoverContainerPosition.RIGHT);
                        break;
                    case PopoverContainerPosition.RIGHT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.RIGHT, entry.intersectionRatio]]);
                        setCurrentPosition(PopoverContainerPosition.LEFT);
                        break;
                    case PopoverContainerPosition.LEFT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.LEFT, entry.intersectionRatio]]);
                        setCurrentPosition(PopoverContainerPosition.TOP);
                        break;
                }
            }
        },
        [initialPosition, checkedPositions, currentPosition, fitPosition]
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

                if (current && targetElement.current) {
                    if (!position) {
                        const observer = getIntersectionObserver(observerCallback).observer;
                        observer.observe(current);
                    }
                    if (!(current instanceof Element)) return;
                    const popoverStyle = calculateOffset({
                        popover: current,
                        offset,
                        targetElement,
                        position: currentPosition,
                        variant,
                        fullWidth: showOverlay ?? false,
                    });
                    const style = showPopover ? popoverStyle + ';visibility:visible' : popoverStyle;

                    const styleWithWidth = setToTargetWidth
                        ? style + ';min-width:fit-content;width:' + targetElement.current?.clientWidth + 'px'
                        : style;
                    current.setAttribute('style', `${styleWithWidth}`);

                    if (initialPosition) setInitialPosition(false);

                    if (variant && variant === PopoverContainerVariant.TOOLTIP && arrowRef) {
                        arrowRef.current?.setAttribute('data-popover-placement', currentPosition);
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
                showPopover,
                initialPosition,
                setToTargetWidth,
                arrowRef,
                showOverlay,
            ]
        ),
        ref
    );
};

export default usePopoverPositioner;
