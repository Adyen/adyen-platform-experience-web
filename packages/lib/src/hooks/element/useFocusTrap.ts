import { useCallback, useMemo, useRef } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import useReflex, { Nullable, Reflexable } from '../useReflex';
import withTabbableRoot, { focusIsWithin, isFocusable } from '../../utils/tabbable';

const useFocusTrap = (rootElementRef: Nullable<Reflexable<Element>>, onEscape: (interactionKeyPressed: boolean) => any) => {
    const escapedFocus = useRef(false);
    const focusElement = useRef<Element | null>(null);
    const interactionKeyPressed = useRef(false);
    const tabbableRoot = useMemo(withTabbableRoot, []);

    const onClickCapture = useMemo(() => {
        let lastFocusableElement: Element | null = null;
        let raf: number | undefined;

        return (evt: Event) => {
            if (raf !== undefined) cancelAnimationFrame(raf);
            let element = evt.target as Element | null;
            while (element && element !== evt.currentTarget) {
                if (isFocusable(element)) {
                    lastFocusableElement = element;
                    raf = requestAnimationFrame(() => {
                        raf = requestAnimationFrame(() => {
                            if (focusElement.current !== lastFocusableElement && lastFocusableElement instanceof HTMLElement) {
                                (focusElement.current = lastFocusableElement)?.focus();
                            }
                            lastFocusableElement = null;
                            raf = undefined;
                        });
                    });
                    return;
                }
                element = element.parentNode as Element | null;
            }
        };
    }, []);

    const onFocusInCapture = useCallback((evt: FocusEvent) => {
        tabbableRoot.current = focusElement.current = evt.target as Element | null;
    }, []);

    const onFocusOutCapture = useCallback((evt: FocusEvent) => {
        if (tabbableRoot.tabbables.includes(evt.relatedTarget as Element)) return;
        if (focusIsWithin(evt.currentTarget as Element, evt.relatedTarget as Element | null)) return;
        if (interactionKeyPressed.current) return;

        escapedFocus.current = true;

        requestAnimationFrame(() => {
            if (escapedFocus.current) onEscape((escapedFocus.current = false));
        });
    }, []);

    const onKeyDownCapture = useMemo(() => {
        let raf: number | undefined;

        return (evt: KeyboardEvent) => {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                case InteractionKeyCode.END:
                case InteractionKeyCode.ESCAPE:
                case InteractionKeyCode.HOME:
                case InteractionKeyCode.PAGE_DOWN:
                case InteractionKeyCode.PAGE_UP:
                case InteractionKeyCode.TAB:
                    cancelAnimationFrame(raf as number);
                    raf = requestAnimationFrame(() => {
                        raf = requestAnimationFrame(() => {
                            interactionKeyPressed.current = false;
                            raf = undefined;
                        });
                    });
                    interactionKeyPressed.current = true;
                    break;
            }
            if (evt.code === InteractionKeyCode.TAB) {
                evt.preventDefault();
                tabbableRoot.current = evt.shiftKey ? -1 : 1;
            } else if (evt.code === InteractionKeyCode.ESCAPE) onEscape(true);
        };
    }, []);

    return useReflex<Element>(
        useCallback((current, previous) => {
            if (previous instanceof Element) {
                (previous as HTMLElement).removeEventListener('keydown', onKeyDownCapture, true);
                (previous as HTMLElement).removeEventListener('focusin', onFocusInCapture, true);
                (previous as HTMLElement).removeEventListener('focusout', onFocusOutCapture, true);
                (current as HTMLElement).removeEventListener('click', onClickCapture, true);
            }

            if (current instanceof Element) {
                (current as HTMLElement).addEventListener('keydown', onKeyDownCapture, true);
                (current as HTMLElement).addEventListener('focusin', onFocusInCapture, true);
                (current as HTMLElement).addEventListener('focusout', onFocusOutCapture, true);
                (current as HTMLElement).addEventListener('click', onClickCapture, true);
                escapedFocus.current = false;
                tabbableRoot.root = current;
            } else tabbableRoot.root = null;
        }, []),
        rootElementRef
    );
};

export default useFocusTrap;
