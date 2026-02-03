import { useCallback, useEffect, useRef } from 'preact/hooks';
import { InteractionKeyCode } from '../../types';
import useBooleanState from '../../../hooks/useBooleanState';

export interface TooltipListeners {
    onfocusin(): void;
    onfocusout(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    onKeyDown(evt: Event): void;
}
export const useTooltipListeners = (
    delay = 500
): {
    isVisible: boolean;
    listeners: TooltipListeners;
} => {
    const [isVisible, setIsVisible] = useBooleanState();
    const visibilityTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const clearVisibilityTimer = useRef(() => {
        visibilityTimerRef.current && clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = undefined;
    }).current;

    const hideTooltip = useCallback(() => {
        clearVisibilityTimer();
        setIsVisible(false);
    }, [clearVisibilityTimer, setIsVisible]);

    const showTooltip = useCallback(() => {
        visibilityTimerRef.current ??= setTimeout(() => {
            visibilityTimerRef.current = setTimeout(hideTooltip, 15000);
            setIsVisible(true);
        }, delay);
    }, [delay, hideTooltip, setIsVisible]);

    const onKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            if (evt.code === InteractionKeyCode.ESCAPE) {
                evt.preventDefault();
                evt.stopPropagation();
                hideTooltip();
            }
        },
        [hideTooltip]
    );

    useEffect(() => hideTooltip, [hideTooltip]);

    return {
        listeners: {
            onfocusin: showTooltip,
            onfocusout: hideTooltip,
            onMouseEnter: showTooltip,
            onMouseLeave: hideTooltip,
            onKeyDown,
        },
        isVisible,
    };
};
