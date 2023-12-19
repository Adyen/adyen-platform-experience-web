import { MutableRef, useCallback } from 'preact/hooks';
import { focusIsWithin } from '@src/utils/tabbable';
import { InteractionKeyCode } from '@src/components/types';

interface UseTooltipProps {
    ref: MutableRef<any>;
    controlRef: MutableRef<any>;
    setIsVisible: (state: boolean) => void;
}

export const useTooltipListeners = ({ ref, controlRef, setIsVisible }: UseTooltipProps) => {
    const onfocusoutCapture = useCallback(() => setIsVisible(false), [setIsVisible]);
    const showTooltip = useCallback(() => setIsVisible(true), [setIsVisible]);

    const onMouseLeave = useCallback(
        (evt: FocusEvent) => {
            const activeElement = evt.relatedTarget as Element;

            const shouldEscape =
                !focusIsWithin(ref.current ?? undefined, activeElement) && !focusIsWithin(controlRef.current ?? undefined, activeElement);

            shouldEscape && setIsVisible(false);
        },

        [setIsVisible]
    );
    const onKeyDown = useCallback((evt: KeyboardEvent) => {
        switch (evt.code) {
            case InteractionKeyCode.ESCAPE:
                setIsVisible(false);
                break;
            default:
                break;
        }
    }, []);
    return { onfocusoutCapture, onMouseLeave, onKeyDown, onFocus: showTooltip, onMouseEnter: showTooltip };
};
