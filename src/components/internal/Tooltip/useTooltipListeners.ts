import { useCallback } from 'preact/hooks';
import { InteractionKeyCode } from '../../types';
import useBooleanState from '../../../hooks/useBooleanState';

export interface TooltipListeners {
    onfocusoutCapture(): void;
    onMouseLeave(): void;
    onKeyDown(evt: Event): void;
    onFocus(): void;
    onMouseEnter(): void;
}
export const useTooltipListeners = (): {
    isVisible: boolean;
    listeners: TooltipListeners;
} => {
    const [isVisible, setIsVisible] = useBooleanState();
    const showTooltip = useCallback(() => setIsVisible(true), [setIsVisible]);
    const hideTooltip = useCallback(() => setIsVisible(false), [setIsVisible]);

    const onKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            switch (evt.code) {
                case InteractionKeyCode.ESCAPE:
                    hideTooltip();
                    break;
                default:
                    break;
            }
        },
        [hideTooltip]
    );

    return {
        listeners: {
            onfocusoutCapture: hideTooltip,
            onMouseLeave: hideTooltip,
            onKeyDown,
            onFocus: showTooltip,
            onMouseEnter: showTooltip,
        },
        isVisible,
    };
};
