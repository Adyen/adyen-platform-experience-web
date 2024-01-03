import { MutableRef, useCallback } from 'preact/hooks';
import { focusIsWithin } from '@src/utils/tabbable';
import { InteractionKeyCode } from '@src/components/types';
import useBooleanState from '@src/hooks/useBooleanState';

interface UseTooltipProps {
    ref?: MutableRef<any>;
    controlRef?: MutableRef<any>;
}

export interface TooltipListeners {
    onfocusoutCapture: any;
    onMouseLeave: any;
    onKeyDown: any;
    onFocus: any;
    onMouseEnter: any;
}
export const useTooltipListeners = ({
    ref,
    controlRef,
}: UseTooltipProps): {
    isVisible: boolean;
    listeners: TooltipListeners;
} => {
    const [isVisible, setIsVisible] = useBooleanState();

    const showTooltip = useCallback((show = true) => {
        setIsVisible(show);
    }, []);

    // listeners

    const onfocusoutCapture = useCallback(() => {
        setIsVisible(false);
    }, []);

    const onMouseLeave = useCallback(
        (evt: FocusEvent) => {
            const activeElement = evt.relatedTarget as Element;

            /* const shouldEscape =
                !focusIsWithin(ref.current ?? undefined, activeElement) && !focusIsWithin(controlRef.current ?? undefined, activeElement); */

            // shouldEscape &&

            showTooltip(true);
        },

        []
    );
    const onKeyDown = useCallback((evt: KeyboardEvent) => {
        switch (evt.code) {
            case InteractionKeyCode.ESCAPE:
                showTooltip(false);
                break;
            default:
                break;
        }
    }, []);

    return {
        listeners: {
            onfocusoutCapture,
            onMouseLeave,
            onKeyDown,
            onFocus: showTooltip,
            onMouseEnter: showTooltip,
        },
        isVisible,
    };
};
