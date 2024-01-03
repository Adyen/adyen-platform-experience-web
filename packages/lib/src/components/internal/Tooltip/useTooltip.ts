import { useEffect, useState } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import { enumerable, noop, struct } from '@src/utils/common';
import watchable from '@src/utils/watchable';
import { TooltipListeners, useTooltipListeners } from '@src/components/internal/Tooltip/useTooltipListeners';

const $tooltips = (listeners: TooltipListeners) =>
    (() => {
        let currentTarget: HTMLElement | undefined;
        let TARGET: HTMLElement | null = null;

        const handleMouseOut = (e: Event) => listeners.onMouseLeave(e, __reset__);
        const handleMouseOver = (e: Event) => listeners.onFocus(e, __listener__);
        const handleFocus = (e: Event) => listeners.onFocus(e, __listener__);
        const handleKeyDown = (e: Event) => listeners.onKeyDown(e, __reset__);
        const handleFocusOut = () => listeners.onfocusoutCapture(__reset__);

        const __listener__ = (evt: Event) => {
            const element: HTMLElement | null = evt.target as HTMLElement;
            if (!TARGET) {
                currentTarget = element;
                $watchable.notify();
            }
        };

        const __reset__ = () => {
            currentTarget = undefined;
            $watchable.notify();
        };

        const startListeningForToolTips = (element: HTMLElement) => {
            element.addEventListener('mouseout', handleMouseOut, true);
            element.addEventListener('mouseover', handleMouseOver, true);
            element.addEventListener('focus', handleFocus, true);
            element.addEventListener('keydown', handleKeyDown, true);
            element.addEventListener('focusout', handleFocusOut, true);
        };
        const stopListeningForToolTips = () => {
            if (TARGET) {
                TARGET.removeEventListener('mouseout', handleMouseOut, true);
                TARGET.removeEventListener('mouseover', handleMouseOver, true);
                TARGET.removeEventListener('focus', handleFocus, true);
                TARGET.removeEventListener('keydown', handleKeyDown, true);
                TARGET.removeEventListener('focusout', handleFocusOut, true);
            }
        };
        const registerToolTipTarget = (element: HTMLElement | null = null) => {
            if (element instanceof HTMLElement) {
                TARGET = element;
                startListeningForToolTips(element);
            }
        };
        const $watchable = watchable({
            get currentTarget() {
                return currentTarget;
            },
        });

        return struct({
            currentTarget: { get: () => currentTarget },
            registerTarget: enumerable(registerToolTipTarget),
            stopListening: enumerable(stopListeningForToolTips),
            watch: enumerable($watchable.watch),
        }) as Readonly<{
            currentTarget: typeof currentTarget;
            registerTarget: typeof registerToolTipTarget;
            stopListening: typeof stopListeningForToolTips;
            watch: (typeof $watchable)['watch'];
        }>;
    })();

const toolTipsRefCallback = () => noop();

const useToolTipPrimitives = () => {
    const [, setState] = useState<DOMHighResTimeStamp>(performance.now());
    const { isVisible, listeners } = useTooltipListeners({});

    const tooltips = $tooltips(listeners);

    const toolTipsHookEffect = (() => {
        let counter = 0;
        const __cleanup__ = () => !--counter && tooltips.stopListening();
        return () => {
            ++counter;
            return __cleanup__;
        };
    })();

    const ref = useReflex<HTMLElement>(tooltips.registerTarget, toolTipsRefCallback);
    useEffect(toolTipsHookEffect, []);
    useEffect(() => {
        return tooltips.watch(() => setState(performance.now()));
    }, []);

    return { ref, isVisible } as const;
};

export default useToolTipPrimitives;
