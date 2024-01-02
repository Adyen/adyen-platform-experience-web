import { useEffect, useState } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import { enumerable, noop, struct } from '@src/utils/common';
import watchable from '@src/utils/watchable';
import { InteractionKeyCode } from '@src/components/types';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import uuidv4 from '@src/utils/uuid';

const $tooltips = (() => {
    let currentTarget: HTMLElement | undefined;
    const TARGETS = new Set<HTMLElement>();

    const __listener__ = (evt: Event) => {
        const element: HTMLElement | null = evt.target as HTMLElement;

        if (TARGETS.has(element)) {
            currentTarget = element;
            $watchable.notify();
        }
    };

    const __reset__ = () => {
        currentTarget = undefined;
        $watchable.notify();
    };

    const __keyDown__ = (evt: KeyboardEvent) => {
        switch (evt.code) {
            case InteractionKeyCode.ESCAPE:
                __reset__();
                break;
            default:
                break;
        }
    };

    const startListeningForToolTips = (element: HTMLElement) => {
        element.addEventListener('mouseout', __reset__, true);
        element.addEventListener('mouseover', __listener__, true);
        element.addEventListener('focus', __listener__, true);
        element.addEventListener('keydown', __keyDown__, true);
        element.addEventListener('focusout', __reset__, true);
    };

    const stopListeningForToolTips = () => {
        TARGETS.forEach(target => {
            target.removeEventListener('mouseover', __listener__, true);
            target.removeEventListener('mouseout', __reset__, true);
            target.removeEventListener('focus', __listener__, true);
            target.removeEventListener('keydown', __keyDown__, true);
            target.removeEventListener('focusout', __reset__, true);
        });
    };

    const registerToolTipTarget = (element?: HTMLElement | null) => {
        if (element instanceof HTMLElement) {
            TARGETS.add(element);
            element.setAttribute('id', uuidv4());
            element.setAttribute('aria-describedby', `tooltip-${element.id}`);
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

    return { ref, currentTarget: $tooltips.currentTarget } as const;
};

export default useToolTip;
