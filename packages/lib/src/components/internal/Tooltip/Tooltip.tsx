import { useRef } from 'preact/hooks';
import './Tooltip.scss';
import { TooltipProps } from './types';
import useBooleanState from '@src/hooks/useBooleanState';
import { useTooltipListeners } from '@src/components/internal/Tooltip/useTooltipListeners';
import { TooltipContent } from '@src/components/internal/Tooltip/TooltipContent';
import useIdentifierString from '@src/hooks/element/useIdentifierString';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { forwardRef } from 'preact/compat';

export const Tooltip = forwardRef(({ content, children, targetRef }: TooltipProps, ref) => {
    console.log((targetRef as any)?.current);

    const [isVisible, setIsVisible] = useBooleanState(false);

    const controllerRef = useRef<HTMLButtonElement>(null);

    const tooltipRef = useUniqueIdentifier();

    const listeners = useTooltipListeners({ ref: tooltipRef, controlRef: controllerRef, setIsVisible });

    const controllerIdentifier = useIdentifierString(tooltipRef);

    return (
        <>
            <span className="adyen-fp-tooltip__controller" ref={controllerRef} aria-describedby={controllerIdentifier} {...listeners}>
                {children}
            </span>
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
});
