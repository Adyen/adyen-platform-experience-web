import { useCallback, useMemo, useState } from 'preact/hooks';
import useReflex, { Reflex } from '@src/hooks/useReflex';
import { PropsWithChildren } from 'preact/compat';
import { FunctionalComponent } from 'preact';
interface TooltipContentProps {
    isVisible: boolean;
    controllerRef?: Reflex<HTMLElement>;
    content: string;
}

const ARROW_HEIGHT = 4;
const TOOLTIP_GAP = 5;

const calculateTooltipPosition = (controllerRect: DOMRect, tooltip: { width: number; height: number }) => {
    const horizontalCenter = controllerRect.left + window.scrollX + controllerRect.width / 2 - tooltip.width / 2;
    const verticalCenter = controllerRect.top - controllerRect.height / 2 + tooltip.height / 2 - TOOLTIP_GAP;

    const topPosition = controllerRect.top - controllerRect.height - ARROW_HEIGHT - TOOLTIP_GAP;
    const bottomPosition = controllerRect.top + controllerRect.height + ARROW_HEIGHT + TOOLTIP_GAP;
    const rightPosition = controllerRect.left + controllerRect.width + ARROW_HEIGHT + TOOLTIP_GAP;
    const leftPosition = controllerRect.left - tooltip.width - ARROW_HEIGHT - TOOLTIP_GAP;

    const top = {
        top: topPosition,
        left: horizontalCenter,
        arrowVertical: topPosition + tooltip.height - ARROW_HEIGHT,
        arrowHorizontal: horizontalCenter + tooltip.width / 2,
    };

    const bottom = {
        top: bottomPosition,
        left: horizontalCenter,
        arrowVertical: bottomPosition - ARROW_HEIGHT,
        arrowHorizontal: horizontalCenter + tooltip.width / 2,
    };

    const right = {
        top: verticalCenter,
        left: rightPosition,
        arrowVertical: verticalCenter + tooltip.height / 2 - TOOLTIP_GAP + 1,
        arrowHorizontal: rightPosition - ARROW_HEIGHT,
    };
    const left = {
        top: verticalCenter,
        left: leftPosition,
        arrowVertical: verticalCenter + tooltip.height / 2 - TOOLTIP_GAP + 1,
        arrowHorizontal: leftPosition + tooltip.width - ARROW_HEIGHT,
    };

    return left;
};

export const TooltipContent: FunctionalComponent<PropsWithChildren<TooltipContentProps>> = ({ isVisible, controllerRef, content }) => {
    const [tooltip, setTooltip] = useState({ width: 0, height: 0 });

    const contentRef = useReflex(
        useCallback(() => {
            if (isVisible) setTooltip({ width: contentRef?.current?.clientWidth ?? 0, height: contentRef?.current?.clientHeight ?? 0 });
        }, [isVisible])
    );

    const tooltipPosition = useMemo(() => {
        const controllerRect = controllerRef?.current?.getBoundingClientRect();

        if (controllerRect) {
            console.log('controllerRect.top', controllerRect.top);
            console.log(tooltip.height);
            return calculateTooltipPosition(controllerRect, tooltip);
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
