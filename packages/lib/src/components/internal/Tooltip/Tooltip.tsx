import { useRef } from 'preact/hooks';
import './Tooltip.scss';
import { TooltipProps } from './types';
import useBooleanState from '@src/hooks/useBooleanState';
import { useTooltipListeners } from '@src/components/internal/Tooltip/useTooltipListeners';
import { TooltipContent } from '@src/components/internal/Tooltip/TooltipContent';

export const Tooltip = ({ content, children }: TooltipProps) => {
    const [isVisible, setIsVisible] = useBooleanState(false);

    const controllerRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const listeners = useTooltipListeners({ ref: tooltipRef, controlRef: controllerRef, setIsVisible });

    return (
        <>
            <button className="adyen-fp-tooltip__controller" ref={controllerRef} tabIndex={0} aria-describedby="tooltip" {...listeners}>
                {children}
            </button>
            {isVisible && (
                <TooltipContent
                    ref={tooltipRef}
                    isVisible={isVisible}
                    content={content}
                    controllerRef={controllerRef}
                    onMouseLeave={listeners.onMouseLeave}
                />
            )}
        </>
    );
};
