import { useCallback, useMemo, useState } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import { PropsWithChildren } from 'preact/compat';
interface TooltipContentProps {
    isVisible: boolean;
    controllerRef?: HTMLElement;
    content: string;
}

const ARROW_HEIGHT = 5;
export const TooltipContent = ({ isVisible, controllerRef, content }: PropsWithChildren<TooltipContentProps>) => {
    const [tooltip, setTooltip] = useState({ width: 0, height: 0 });

    const contentRef = useReflex(
        useCallback(() => {
            if (isVisible) setTooltip({ width: contentRef?.current?.clientWidth ?? 0, height: contentRef?.current?.clientHeight ?? 0 });
        }, [isVisible])
    );

    const tooltipPosition = useMemo(() => {
        const controllerRect = controllerRef?.getBoundingClientRect();

        if (controllerRect) {
            return {
                top: controllerRect.top - controllerRect.height - tooltip.height / 2 - ARROW_HEIGHT,
                left: controllerRect.left - 3 + window.scrollX + controllerRect.width / 2 - tooltip.width / 2,
            };
        }
        return {
            top: 0,
            left: 0,
        };
    }, [controllerRef, tooltip.width, tooltip.height]);

    return (
        <>
            <div
                style={`transform: translate3d(${tooltipPosition.left}px, ${tooltipPosition.top}px, 0px)`}
                className="adyen-fp-tooltip__content"
                id={`tooltip-${controllerRef?.id}`}
                role="tooltip"
                aria-hidden={!isVisible}
                ref={contentRef}
            >
                {content}
            </div>
            <span
                className="adyen-fp-tooltip__arrow"
                style={`transform: translate3d(${tooltipPosition.left + tooltip.width / 2}px, ${
                    tooltipPosition.top + tooltip.height - ARROW_HEIGHT
                }px, 0px) rotate(45deg)`}
            ></span>
        </>
    );
};
