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
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(({ isVisible, controllerRef, onMouseLeave, content }, tooltipRef) => {
    const controllerPosition = useMemo(() => controllerRef.current?.getBoundingClientRect(), [controllerRef.current]);
    const contentRef = useReflex(
        useCallback(() => {
            console.log(controllerRef.current.clientHeight);
            if (isVisible) setTooltip({ width: contentRef?.current?.clientWidth ?? 0, height: contentRef?.current?.clientHeight ?? 0 });
        }, [isVisible]),
        tooltipRef as Reflexable<HTMLDivElement>
    );

    const [tooltip, setTooltip] = useState({ width: 0, height: 0 });
    const tooltipPosition = useMemo(() => {
        if (controllerPosition) {
            return {
                top: controllerPosition.top - (controllerRef.current?.clientHeight ?? 0) - tooltip.height - 40,
                left: controllerPosition.left + window.scrollX + controllerPosition.width / 2 - tooltip.width / 2,
            };
        }
        return {
            top: 0,
            left: 0,
        };
    }, [controllerRef.current, tooltip.width]);

    return (
        <div
            style={`transform: translate3d(${tooltipPosition.left}px, ${tooltipPosition.top}px, 0px)`}
            className={cx('adyen-fp-tooltip__content', {
                'adyen-fp-tooltip__content--hidden': tooltip.width === 0,
            })}
            id="tooltip"
            role="tooltip"
            aria-hidden={!isVisible}
            ref={contentRef}
            onMouseLeave={onMouseLeave}
        >
            {content}
        </div>
    );
});
