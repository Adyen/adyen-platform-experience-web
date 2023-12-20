import { useEffect, useState } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import { enumerable, noop, struct } from '@src/utils/common';
import watchable from '@src/utils/watchable';

const $tooltips = (() => {
    let currentTarget: HTMLElement | undefined;
    let listeningForToolTips = false;
    const TARGETS = new WeakSet<HTMLElement>();

    const __listener__ = (evt: Event) => {
        let element: HTMLElement | null = evt.target as HTMLElement;

        while (element && element !== evt.currentTarget) {
            if (TARGETS.has(element)) {
                currentTarget = element;
                $watchable.notify();
                break;
            }

            element = element.parentNode as HTMLElement;
        }
    };

    const __reset__ = () => {
        currentTarget = undefined;
        $watchable.notify();
    };

    const startListeningForToolTips = () => {
        if (!listeningForToolTips) {
            document.body.addEventListener('mouseout', __reset__, true);
            document.body.addEventListener('mouseover', __listener__, true);
            listeningForToolTips = true;
        }
    };

    const stopListeningForToolTips = () => {
        document.body.removeEventListener('mouseover', __listener__, true);
        document.body.removeEventListener('mouseout', __reset__, true);
        listeningForToolTips = false;
    };

    const registerToolTipTarget = (element?: HTMLElement | null) => {
        if (element instanceof HTMLElement) {
            TARGETS.add(element);
            startListeningForToolTips();
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

const toolTipsHookEffect = (() => {
    let counter = 0;
    const __cleanup__ = () => !--counter && $tooltips.stopListening();
    return () => {
        ++counter;
        return __cleanup__;
    };
})();

const toolTipsRefCallback = () => noop();

const useToolTip = () => {
    const [, setState] = useState<DOMHighResTimeStamp>(performance.now());
    const ref = useReflex<HTMLElement>($tooltips.registerTarget, toolTipsRefCallback);
    useEffect(toolTipsHookEffect, []);
    useEffect(() => {
        return $tooltips.watch(() => setState(performance.now()));
    }, []);
    return { ref } as const;
};

export default useToolTip;
