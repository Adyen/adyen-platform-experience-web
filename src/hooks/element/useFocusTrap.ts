import { useCallback, useMemo, useRef } from 'preact/hooks';
import { InteractionKeyCode } from '../../components/types';
import { isUndefined } from '../../utils';
import withTabbableRoot, { focusIsWithin, isFocusable } from '../../primitives/dom/tabbableRoot/tabbable';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../utils/types';
import useReflex from '../useReflex';

const useFocusTrap = <T extends Element>(rootElementRef: Nullable<Reflexable<T>>, onEscape: (interactionKeyPressed: boolean) => any) => {
    const escapedFocus = useRef(false);
    const focusElement = useRef<Element | null>(null);
    const interactionKeyPressed = useRef(false);
    const lastInteractionKey = useRef<string | null>(null);
    const lastTabDirection = useRef<1 | -1>(1);
    const setRootTabIndex = useRef(false);
    const tabbableRoot = useMemo(withTabbableRoot, []);

    const focusFallback = useCallback((root: Element) => {
        const lastFocused = focusElement.current;
        if (lastFocused instanceof HTMLElement && focusIsWithin(root, lastFocused)) {
            lastFocused.focus();
            return;
        }
        if (root instanceof HTMLElement) root.focus();
    }, []);

    const onClickCapture = useMemo(() => {
        let lastFocusableElement: Element | null = null;
        let raf: number | undefined;

        return (evt: Event) => {
            if (!isUndefined(raf)) cancelAnimationFrame(raf);

            const eventPath = evt.composedPath();
            let element = eventPath[0] as Element | null;
            let index = 0;

            while (element && element !== evt.currentTarget) {
                if (element instanceof Element && isFocusable(element)) {
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
                element = eventPath[++index] as Element | null;
            }
        };
    }, []);

    const onFocusInCapture = useCallback((evt: FocusEvent) => {
        tabbableRoot.current = focusElement.current = (evt.composedPath()[0] || evt.target) as Element | null;
    }, []);

    const onDocumentFocusInCapture = useCallback((evt: FocusEvent) => {
        const root = tabbableRoot.root;
        if (!(root instanceof Element)) return;

        const target = (evt.composedPath()[0] || evt.target) as Element | null;
        if (focusIsWithin(root, target)) return;

        // Only trap focus if it's moving from within this trap.
        if (!focusIsWithin(root, evt.relatedTarget as Element | null)) return;

        if (interactionKeyPressed.current && lastInteractionKey.current === InteractionKeyCode.TAB) {
            const tabbables = tabbableRoot.tabbables;
            if (tabbables.length) {
                const nextIndex = lastTabDirection.current === -1 ? tabbables.length - 1 : 0;
                (tabbables[nextIndex] as HTMLElement)?.focus();
            } else {
                focusFallback(root);
            }
        }
    }, []);

    const onFocusOut = useCallback((evt: FocusEvent) => {
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
            lastInteractionKey.current = evt.code;
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
                lastTabDirection.current = evt.shiftKey ? -1 : 1;

                if (tabbableRoot.tabbables.length) {
                    tabbableRoot.current = lastTabDirection.current;
                } else if (tabbableRoot.root instanceof Element) {
                    focusFallback(tabbableRoot.root);
                }
            } else if (evt.code === InteractionKeyCode.ESCAPE) onEscape(true);
        };
    }, []);

    return useReflex<T>(
        useCallback((current, previous) => {
            if (previous instanceof Element) {
                (previous as unknown as HTMLElement).removeEventListener('keydown', onKeyDownCapture, true);
                (previous as unknown as HTMLElement).removeEventListener('focusin', onFocusInCapture, true);
                (previous as unknown as HTMLElement).removeEventListener('focusout', onFocusOut, false);
                (previous as unknown as HTMLElement).removeEventListener('click', onClickCapture, true);
                document.removeEventListener('focusin', onDocumentFocusInCapture, true);

                if (setRootTabIndex.current && previous instanceof HTMLElement) {
                    previous.removeAttribute('tabindex');
                    setRootTabIndex.current = false;
                }
            }

            if (current instanceof Element) {
                (current as unknown as HTMLElement).addEventListener('keydown', onKeyDownCapture, true);
                (current as unknown as HTMLElement).addEventListener('focusin', onFocusInCapture, true);
                (current as unknown as HTMLElement).addEventListener('focusout', onFocusOut, false);
                (current as unknown as HTMLElement).addEventListener('click', onClickCapture, true);
                document.addEventListener('focusin', onDocumentFocusInCapture, true);
                escapedFocus.current = false;
                tabbableRoot.root = current;

                if (current instanceof HTMLElement && !current.hasAttribute('tabindex')) {
                    current.setAttribute('tabindex', '-1');
                    setRootTabIndex.current = true;
                }

                // Automatically focus inside the trap if focus is not already within it
                if (!focusIsWithin(current, document.activeElement)) {
                    if (current instanceof HTMLElement) {
                        current.focus();
                    }
                }
            } else tabbableRoot.root = null;
        }, []),
        rootElementRef
    );
};

export default useFocusTrap;
