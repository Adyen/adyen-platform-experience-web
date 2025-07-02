import { h, Ref } from 'preact';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import getIntersectionObserver from '../../components/internal/Popover/utils/utils';
import { PopoverContainerPosition, PopoverContainerVariant } from '../../components/internal/Popover/types';
import { isRefObject } from '../../primitives/reactive/reflex/helpers';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../utils/types';
import useReflex from '../useReflex';

const calculateOffset = ({
    position,
    variant,
    offset,
    additionalStyle,
    fixedPositioning,
    fullWidth,
    popover,
    targetElement,
}: {
    position: PopoverContainerPosition;
    variant: PopoverContainerVariant;
    offset: [number, number, number, number];
    additionalStyle?: { minY?: number; maxY?: number };
    fixedPositioning?: boolean;
    fullWidth?: boolean;
    popover: Element;
    targetElement: HTMLElement;
}): h.JSX.CSSProperties => {
    let translateX = 0;
    let translateY = 0;

    const isTooltip = variant === PopoverContainerVariant.TOOLTIP;

    const popoverHeight = popover.clientHeight;
    const popoverWidth = popover.clientWidth;
    const popoverContent = popover.firstChild as HTMLElement;

    const popoverContentHeight = popoverContent.offsetHeight;
    const popoverContentWidth = popoverContent.offsetWidth;

    const bodyPosition = document.body.getBoundingClientRect();
    const targetPosition = targetElement.getBoundingClientRect();

    const toCenterFullWidth = bodyPosition.x + (bodyPosition.width - popoverContentWidth) / 2;
    const toCenterX = targetPosition.x + (targetPosition.width - popoverContentWidth) / 2;
    const toCenterY = targetPosition.y + (targetPosition.height - popoverContentHeight) / 2;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    switch (position) {
        case PopoverContainerPosition.BOTTOM:
            translateX = fullWidth ? toCenterFullWidth : isTooltip ? toCenterX : targetPosition.x;
            translateY = targetPosition.y + targetPosition.height + offset[1];

            if (!fixedPositioning) {
                if (!fullWidth) {
                    translateX += scrollX;
                }
                translateY += scrollY;
            }
            break;
        case PopoverContainerPosition.BOTTOM_LEFT:
            translateX = targetPosition.x + targetPosition.width - popoverWidth;
            translateY = targetPosition.y + targetPosition.height + offset[1];

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY;
            }
            break;
        case PopoverContainerPosition.TOP:
            translateX = isTooltip ? toCenterX : targetPosition.x;
            translateY = targetPosition.y - (popoverHeight + offset[0]);

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY - popoverContent.clientHeight + popoverHeight;
            }
            break;
        case PopoverContainerPosition.RIGHT:
            translateX = targetPosition.x + targetPosition.width + offset[2];
            translateY = isTooltip ? toCenterY : targetPosition.y - targetPosition.height / 2;

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY;
            }
            break;
        case PopoverContainerPosition.LEFT:
            translateX = targetPosition.x - (popoverWidth + offset[3]);
            translateY = isTooltip ? toCenterY : targetPosition.y - targetPosition.height / 2;

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY;
            }
            break;
    }

    // [IMPORTANT]:
    // - Use hyphen-case for CSS property names (as you would for CSSStyleDeclaration.setProperty)
    // - Use string for CSS property values (as you would for CSSStyleDeclaration.setProperty)
    const offsetStyle: h.JSX.CSSProperties = {};

    if (additionalStyle) {
        const isMaxLimits = !!additionalStyle.maxY && translateY + popover?.clientHeight > additionalStyle.maxY;
        const isMinLimits = !!additionalStyle.minY && translateY < additionalStyle.minY;

        if (isMaxLimits && additionalStyle.maxY) {
            const targetVerticalPosition = targetPosition.y + targetPosition.height + 8; // [TODO]: Capture 8 as a constant
            const height = Math.max(0, additionalStyle.maxY - targetVerticalPosition);

            if (height > 20) {
                offsetStyle.height = `${height}px`;
            }

            offsetStyle['overflow-y'] = 'scroll';
        }

        if (isMinLimits && additionalStyle.minY && translateY) {
            const popoverHeight = (popover as HTMLElement).offsetHeight ?? (popover as HTMLElement).clientHeight;
            const targetHeight = Math.max(0, popoverHeight - (additionalStyle.minY - translateY));

            offsetStyle.height = `${targetHeight}px`;

            if (targetHeight) {
                offsetStyle['overflow-y'] = 'scroll';
            }
        }

        if (isMinLimits) {
            translateY = additionalStyle.minY ?? 0;
        }
    }

    return {
        inset: '0 auto auto 0',
        margin: '0',
        position: fixedPositioning ? 'fixed' : 'absolute',
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
        visibility: 'hidden',
        ...offsetStyle,
    };
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
    fixedPositioning?: boolean,
    additionalStyle?: { minY?: number; maxY?: number },
    ref?: Nullable<Reflexable<Element>>
) => {
    const [initialPosition, setInitialPosition] = useState(true);
    const [showPopover, setShowPopover] = useState(fitPosition ? !fitPosition : !!position);
    const [currentPosition, setCurrentPosition] = useState(position || PopoverContainerPosition.TOP);
    const [checkedPositions, setCheckedPosition] = useState<Array<[PopoverContainerPosition, number]>>([]);

    const observerCallback = useCallback(
        (entry: IntersectionObserverEntry) => {
            if (entry.intersectionRatio === 1) return setShowPopover(true);

            if (!initialPosition && entry.intersectionRatio !== 1) {
                if (checkedPositions && checkedPositions.length === (fitPosition ? 5 : 4)) {
                    const bestPos = checkedPositions.reduce((res, pos) => (pos[1] > res[1] ? pos : res), checkedPositions[0]!);
                    setCurrentPosition(bestPos[0]);
                    return setShowPopover(true);
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
                    case PopoverContainerPosition.BOTTOM_LEFT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.BOTTOM, entry.intersectionRatio]]);
                        setCurrentPosition(PopoverContainerPosition.RIGHT);
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
                if (previous && (!position || fitPosition)) {
                    const observer = getIntersectionObserver(observerCallback).observer;
                    observer.unobserve(previous);
                }

                if (current && targetElement.current) {
                    if (!position || fitPosition) {
                        const observer = getIntersectionObserver(observerCallback).observer;
                        observer.observe(current);
                    }

                    if (!(current instanceof Element)) return;

                    const popoverStyle = calculateOffset({
                        variant,
                        offset,
                        additionalStyle,
                        fixedPositioning,
                        fullWidth: showOverlay,
                        popover: current,
                        position: currentPosition,
                        targetElement: targetElement.current as HTMLElement,
                    });

                    const style = {
                        ...popoverStyle,
                        ...(showPopover && { visibility: 'visible' }),
                        ...(setToTargetWidth && {
                            'min-width': 'fit-content',
                            width: `${targetElement.current.clientWidth}px`,
                        }),
                    };

                    (current as HTMLElement).setAttribute(
                        'style',
                        Object.entries(style)
                            .map(entry => entry.join(':'))
                            .join(';')
                    );

                    if (initialPosition) setInitialPosition(false);

                    if (variant && variant === PopoverContainerVariant.TOOLTIP && arrowRef && isRefObject(arrowRef)) {
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
                fitPosition,
                fixedPositioning,
                additionalStyle,
            ]
        ),
        ref
    );
};

export default usePopoverPositioner;
