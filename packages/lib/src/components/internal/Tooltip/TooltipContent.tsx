import { useCallback, useMemo, useState } from 'preact/hooks';
import useReflex, { Reflex } from '@src/hooks/useReflex';
import { PropsWithChildren } from 'preact/compat';
import { FunctionalComponent } from 'preact';

type TooltipPosition = 'TOP' | 'BOTTOM' | 'RIGHT' | 'LEFT';
interface TooltipContentProps {
    isVisible: boolean;
    controllerRef?: Reflex<HTMLElement>;
    content: string;
    position?: TooltipPosition;
}

const ARROW_HEIGHT = 4;
const TOOLTIP_GAP = 6;

const calculateTooltipPosition = ({
    position,
    controllerRect,
    tooltip,
}: {
    position: TooltipPosition;
    controllerRect: DOMRect;
    tooltip: { width: number; height: number };
}) => {
    const horizontalCenter = controllerRect.left + window.scrollX + controllerRect.width / 2 - tooltip.width / 2;
    const verticalCenter = controllerRect.top - controllerRect.height / 2 + tooltip.height / 2 - TOOLTIP_GAP;

    const topPosition = controllerRect.top - controllerRect.height - ARROW_HEIGHT - TOOLTIP_GAP;
    const bottomPosition = controllerRect.top + controllerRect.height + ARROW_HEIGHT + TOOLTIP_GAP;
    const rightPosition = controllerRect.left + controllerRect.width + ARROW_HEIGHT + TOOLTIP_GAP;
    const leftPosition = controllerRect.left - tooltip.width - ARROW_HEIGHT - TOOLTIP_GAP;

    const arrowVerticalCenter = verticalCenter + tooltip.height / 2 - TOOLTIP_GAP + ARROW_HEIGHT / 2;
    const arrowHorizontalCenter = horizontalCenter + tooltip.width / 2;

    const arrowLeft = leftPosition + tooltip.width - ARROW_HEIGHT;
    const arrowRight = rightPosition - ARROW_HEIGHT;
    const arrowTop = topPosition + tooltip.height - ARROW_HEIGHT;
    const arrowBottom = bottomPosition - ARROW_HEIGHT;

    const top = {
        top: topPosition,
        left: horizontalCenter,
        arrowVertical: arrowTop,
        arrowHorizontal: arrowHorizontalCenter,
    };

    const bottom = {
        top: bottomPosition,
        left: horizontalCenter,
        arrowVertical: arrowBottom,
        arrowHorizontal: arrowHorizontalCenter,
    };

    const right = {
        top: verticalCenter,
        left: rightPosition,
        arrowVertical: arrowVerticalCenter,
        arrowHorizontal: arrowRight,
    };
    const left = {
        top: verticalCenter,
        left: leftPosition,
        arrowVertical: arrowVerticalCenter,
        arrowHorizontal: arrowLeft,
    };

    switch (position) {
        case 'BOTTOM':
            if (tooltip.height + ARROW_HEIGHT + TOOLTIP_GAP > controllerRect.top) return top;
            return bottom;
        case 'TOP':
            if (tooltip.height + ARROW_HEIGHT + TOOLTIP_GAP > controllerRect.top) return bottom;
            return top;
        case 'RIGHT':
            if (tooltip.width + ARROW_HEIGHT + TOOLTIP_GAP > window.innerWidth - controllerRect.right) return left;
            return right;
        case 'LEFT':
            if (tooltip.width + ARROW_HEIGHT + TOOLTIP_GAP > controllerRect.left) return right;
            return left;
        default:
            return top;
    }
};

export const TooltipContent: FunctionalComponent<PropsWithChildren<TooltipContentProps>> = ({
    isVisible,
    controllerRef,
    content,
    position = 'LEFT',
}) => {
    const [tooltip, setTooltip] = useState({ width: 0, height: 0 });

    const contentRef = useReflex(
        useCallback(() => {
            if (isVisible) setTooltip({ width: contentRef?.current?.clientWidth ?? 0, height: contentRef?.current?.clientHeight ?? 0 });
        }, [isVisible])
    );

    const tooltipPosition = useMemo(() => {
        const controllerRect = controllerRef?.current?.getBoundingClientRect();

        if (controllerRect) {
            return calculateTooltipPosition({ controllerRect, tooltip, position });
        }
        return {
            top: 0,
            left: 0,
            arrowVertical: 0,
            arrowHorizontal: 0,
        };
    }, [controllerRef, tooltip.width, tooltip.height]);

    return (
        <>
            <div
                style={`transform: translate3d(${tooltipPosition.left}px, ${tooltipPosition.top}px, 0px)`}
                className="adyen-fp-tooltip__content"
                id={`tooltip-${controllerRef?.current?.id}`}
                role="tooltip"
                aria-hidden={!isVisible}
                ref={contentRef}
            >
                {content}
            </div>
            <span
                className="adyen-fp-tooltip__arrow"
                style={`transform: translate3d(${tooltipPosition.arrowHorizontal}px, ${tooltipPosition.arrowVertical}px, 0px) rotate(45deg)`}
            ></span>
        </>
    );
};
