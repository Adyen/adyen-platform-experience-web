import { useCallback, useMemo, useState } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import { TooltipContentProps } from './types';
import { calculateTooltipPosition } from './utils';

export const TooltipContent = ({ isVisible, controllerRef, content, position = 'top' }: TooltipContentProps) => {
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
