import { MutableRef, useCallback, useMemo, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import cx from 'classnames';
import useReflex, { Reflexable } from '@src/hooks/useReflex';
interface TooltipContentProps {
    isVisible: boolean;
    controllerRef: MutableRef<any>;
    onMouseLeave: any;
    content: string;
}

const ARROW_HEIGHT = 5;
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(({ isVisible, controllerRef, onMouseLeave, content }, tooltipRef) => {
    const [tooltip, setTooltip] = useState({ width: 0, height: 0 });

    const contentRef = useReflex(
        useCallback(() => {
            if (isVisible) setTooltip({ width: contentRef?.current?.clientWidth ?? 0, height: contentRef?.current?.clientHeight ?? 0 });
        }, [isVisible]),
        tooltipRef as Reflexable<HTMLDivElement>
    );

    const tooltipPosition = useMemo(() => {
        const controllerRect = controllerRef.current?.getBoundingClientRect();

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
    }, [controllerRef.current, tooltip.width, tooltip.height]);

    return (
        <div
            className={cx('adyen-fp-tooltip__container', {
                'adyen-fp-tooltip__container--hidden': tooltip.width === 0,
            })}
        >
            <div
                style={`transform: translate3d(${tooltipPosition.left}px, ${tooltipPosition.top}px, 0px)`}
                className="adyen-fp-tooltip__content"
                id="tooltip"
                role="tooltip"
                aria-hidden={!isVisible}
                ref={contentRef}
                onMouseLeave={onMouseLeave}
            >
                {content}
            </div>
            <span
                className="adyen-fp-tooltip__arrow"
                style={`transform: translate3d(${tooltipPosition.left + tooltip.width / 2}px, ${
                    tooltipPosition.top + tooltip.height - ARROW_HEIGHT
                }px, 0px) rotate(45deg)`}
            ></span>
        </div>
    );
});
