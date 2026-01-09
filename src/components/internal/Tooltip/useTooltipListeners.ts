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
export const useTooltipListeners = (): {
    isVisible: boolean;
    listeners: TooltipListeners;
} => {
    const [isVisible, setIsVisible] = useBooleanState();
    const visibilityTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const clearVisibilityTimer = useRef(() => {
        visibilityTimerRef.current && clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = undefined;
    }).current;

    const showTooltip = useCallback(() => {
        visibilityTimerRef.current ??= setTimeout(() => {
            visibilityTimerRef.current = setTimeout(hideTooltip, 15000);
            setIsVisible(true);
        }, 500);
    }, [setIsVisible]);

    const hideTooltip = useCallback(() => {
        clearVisibilityTimer();
        setIsVisible(false);
    }, [setIsVisible]);

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
