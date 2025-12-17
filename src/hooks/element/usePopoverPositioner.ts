import { h, Ref } from 'preact';
import { MutableRef, useCallback, useEffect, useRef, useState } from 'preact/hooks';
import getIntersectionObserver from '../../components/internal/Popover/utils/utils';
import { PopoverContainerPosition, PopoverContainerVariant } from '../../components/internal/Popover/types';
import { isRefObject } from '../../primitives/reactive/reflex/helpers';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../utils/types';
import useReflex from '../useReflex';

const FULL_WIDTH_TOOLTIP_POSITIONS = [
    PopoverContainerPosition.BOTTOM_RIGHT,
    PopoverContainerPosition.BOTTOM_LEFT,
    PopoverContainerPosition.TOP_RIGHT,
    PopoverContainerPosition.TOP_LEFT,
];

const POPOVER_DIAGONAL_HORIZONTAL_OFFSET = 5;
const ARROW_OFFSET = 4;
const SCREEN_EDGE_MARGIN = 10;

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
        case PopoverContainerPosition.BOTTOM_LEFT:
            translateX = 5;
            translateY = targetPosition.y + targetPosition.height + offset[1];

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY;
            }
            break;
        case PopoverContainerPosition.BOTTOM_RIGHT:
            translateX = -5;
            translateY = targetPosition.y + targetPosition.height + offset[1];

            if (!fixedPositioning) {
                translateX = scrollX - (bodyPosition.width - targetPosition.right);
                translateY += scrollY;
            }
            break;
        case PopoverContainerPosition.TOP_LEFT:
            translateX = POPOVER_DIAGONAL_HORIZONTAL_OFFSET;
            translateY = targetPosition.y - popoverHeight;

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY - popoverContent.clientHeight + popoverHeight;
            }
            break;
        case PopoverContainerPosition.TOP_RIGHT:
            translateX = -POPOVER_DIAGONAL_HORIZONTAL_OFFSET;
            translateY = targetPosition.y - popoverHeight;

            if (!fixedPositioning) {
                translateX += scrollX;
                translateY += scrollY - popoverContent.clientHeight + popoverHeight;
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

    const isAlignedToRight = position === PopoverContainerPosition.TOP_RIGHT || position === PopoverContainerPosition.BOTTOM_RIGHT;

    return {
        inset: isAlignedToRight ? '0 0 auto auto' : '0 auto auto 0',
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
    ref?: Nullable<Reflexable<Element>>,
    contentRef?: Ref<HTMLDivElement> | undefined
) => {
    const [initialPosition, setInitialPosition] = useState(true);
    const [showPopover, setShowPopover] = useState(fitPosition ? !fitPosition : !!position);
    const [currentPosition, setCurrentPosition] = useState(position || PopoverContainerPosition.TOP);
    const [checkedPositions, setCheckedPosition] = useState<Array<[PopoverContainerPosition, number]>>([]);

    const observerCallback = useCallback(
        (entry: IntersectionObserverEntry) => {
            const screenWidth = document.documentElement.clientWidth;
            const targetPosition = targetElement.current?.getBoundingClientRect();

            if (entry.intersectionRatio === 1) return setShowPopover(true);

            if (!initialPosition && entry.intersectionRatio !== 1) {
                if (checkedPositions && checkedPositions.length === (fitPosition ? 8 : 4)) {
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
                        setCurrentPosition(
                            fitPosition
                                ? (targetPosition?.x || 0) > screenWidth / 2
                                    ? PopoverContainerPosition.BOTTOM_RIGHT
                                    : PopoverContainerPosition.BOTTOM_LEFT
                                : PopoverContainerPosition.RIGHT
                        );
                        break;
                    case PopoverContainerPosition.BOTTOM_LEFT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.BOTTOM_LEFT, entry.intersectionRatio]]);
                        setCurrentPosition(fitPosition ? PopoverContainerPosition.TOP_LEFT : PopoverContainerPosition.RIGHT);
                        break;
                    case PopoverContainerPosition.BOTTOM_RIGHT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.BOTTOM_RIGHT, entry.intersectionRatio]]);
                        setCurrentPosition(fitPosition ? PopoverContainerPosition.TOP_RIGHT : PopoverContainerPosition.RIGHT);
                        break;
                    case PopoverContainerPosition.TOP_LEFT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.TOP_LEFT, entry.intersectionRatio]]);
                        setCurrentPosition(fitPosition ? PopoverContainerPosition.BOTTOM_LEFT : PopoverContainerPosition.RIGHT);
                        break;
                    case PopoverContainerPosition.TOP_RIGHT:
                        setCheckedPosition(value => [...value, [PopoverContainerPosition.TOP_RIGHT, entry.intersectionRatio]]);
                        setCurrentPosition(fitPosition ? PopoverContainerPosition.BOTTOM_RIGHT : PopoverContainerPosition.RIGHT);
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
        [targetElement, initialPosition, checkedPositions, fitPosition, currentPosition]
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
                        if (FULL_WIDTH_TOOLTIP_POSITIONS.includes(currentPosition)) {
                            const targetPosition = targetElement.current.getBoundingClientRect();
                            const popoverContent = current.firstChild as HTMLElement;
                            const popoverContentWidth = popoverContent.offsetWidth;
                            const positionX = targetPosition.x + (targetPosition.width - popoverContentWidth) / 2;
                            const popoverContentHeight = popoverContent.offsetHeight;

                            const positionY =
                                currentPosition === PopoverContainerPosition.BOTTOM_RIGHT || currentPosition === PopoverContainerPosition.BOTTOM_LEFT
                                    ? popoverContentHeight + ARROW_OFFSET
                                    : ARROW_OFFSET;

                            arrowRef.current?.setAttribute(
                                'style',
                                `transform: translate3d(${positionX}px, -${positionY}px, 0) rotate(45deg); inset: 0 0 auto auto`
                            );
                        }
                    }

                    if (
                        variant &&
                        variant === PopoverContainerVariant.TOOLTIP &&
                        contentRef &&
                        isRefObject(contentRef) &&
                        FULL_WIDTH_TOOLTIP_POSITIONS.includes(currentPosition)
                    ) {
                        const screenWidth = document.documentElement.clientWidth;
                        contentRef.current?.setAttribute('style', `max-width: ${screenWidth - SCREEN_EDGE_MARGIN}px`);
                    }
                }
            },
            [
                position,
                fitPosition,
                targetElement,
                observerCallback,
                variant,
                offset,
                additionalStyle,
                fixedPositioning,
                showOverlay,
                currentPosition,
                showPopover,
                setToTargetWidth,
                initialPosition,
                arrowRef,
                contentRef,
            ]
        ),
        ref
    );
};

export default usePopoverPositioner;
