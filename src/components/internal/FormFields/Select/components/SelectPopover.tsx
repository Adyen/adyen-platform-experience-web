import { createPortal } from 'preact/compat';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { MutableRef } from 'preact/hooks';
import { ComponentChildren } from 'preact';
import { CONTROL_ELEMENT_PROPERTY, useClickOutside, ClickOutsideVariant } from '../../../../../hooks/element/useClickOutside';
import useFocusTrap from '../../../../../hooks/element/useFocusTrap';
import useReflex from '../../../../../hooks/useReflex';
import { InteractionKeyCode } from '../../../../types';
import classNames from 'classnames';
import './SelectPopover.scss';
import useUniqueId from '../../../../../hooks/useUniqueId';

// Helper to find the nearest scrollable parent element
const getScrollableParent = (element: HTMLElement | null): HTMLElement => {
    if (!element) return document.body;

    let parent = element.parentElement;
    while (parent) {
        const style = window.getComputedStyle(parent);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowX === 'auto' || overflowX === 'scroll';

        if (isScrollable && parent.scrollHeight > parent.clientHeight) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return document.body;
};

interface SelectPopoverPosition {
    placement: 'top' | 'bottom';
    maxHeight: number;
    top: number;
    left: number;
    width: number | null;
}

interface SelectPopoverProps {
    isOpen: boolean;
    triggerRef: MutableRef<HTMLElement | null>;
    onDismiss: () => void;
    children: ComponentChildren;
    disableFocusTrap?: boolean;
    setToTargetWidth?: boolean;
    showOverlay?: boolean;
    classNameModifiers?: string[];
    maxHeight?: number;
}

const OFFSET = 4;
const VIEWPORT_PADDING = 8;
const DEFAULT_MAX_HEIGHT = 375;

const SelectPopover = ({
    isOpen,
    triggerRef,
    onDismiss,
    children,
    disableFocusTrap = false,
    setToTargetWidth = false,
    showOverlay = false,
    classNameModifiers,
    maxHeight: maxHeightProp,
}: SelectPopoverProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<SelectPopoverPosition | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const popoverId = useRef(`select-popover-${useUniqueId()}`);
    const capturedWidthRef = useRef<number | null>(null);
    const defaultMaxHeight = maxHeightProp || DEFAULT_MAX_HEIGHT;

    // Lock scroll on nearest scrollable parent when popover is open
    useLayoutEffect(() => {
        if (isOpen && triggerRef.current) {
            const scrollableParent = getScrollableParent(triggerRef.current);

            const preventScroll = (e: Event) => {
                // Allow scrolling inside the popover content
                const target = e.target as Node;
                if (contentRef.current?.contains(target) || popoverRef.current?.contains(target)) {
                    return;
                }
                e.preventDefault();
            };

            const preventScrollKeys = (e: KeyboardEvent) => {
                // Allow keyboard navigation inside popover
                const target = e.target as Node;
                if (contentRef.current?.contains(target) || popoverRef.current?.contains(target)) {
                    return;
                }
                const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];
                if (scrollKeys.includes(e.code) && e.target === scrollableParent) {
                    e.preventDefault();
                }
            };

            scrollableParent.addEventListener('wheel', preventScroll, { passive: false });
            scrollableParent.addEventListener('touchmove', preventScroll, { passive: false });
            scrollableParent.addEventListener('keydown', preventScrollKeys, { passive: false });

            return () => {
                scrollableParent.removeEventListener('wheel', preventScroll);
                scrollableParent.removeEventListener('touchmove', preventScroll);
                scrollableParent.removeEventListener('keydown', preventScrollKeys);
            };
        }
    }, [isOpen, triggerRef]);

    const calculatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        const content = contentRef.current;

        if (!trigger || !isOpen) {
            setPosition(null);
            setIsVisible(false);
            capturedWidthRef.current = null;
            return;
        }

        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Capture the trigger width on first calculation to prevent shrinking
        if (setToTargetWidth && capturedWidthRef.current === null) {
            capturedWidthRef.current = triggerRect.width;
        }

        // Calculate available space above and below
        const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_PADDING;
        const spaceAbove = triggerRect.top - VIEWPORT_PADDING;

        // Get content's natural height
        let naturalHeight = defaultMaxHeight;
        if (content) {
            const originalMaxHeight = content.style.maxHeight;
            const originalOverflow = content.style.overflowY;
            content.style.maxHeight = 'none';
            content.style.overflowY = 'visible';
            naturalHeight = content.scrollHeight;
            content.style.maxHeight = originalMaxHeight;
            content.style.overflowY = originalOverflow;
        }

        // Determine placement and max height
        // Default to 375px max height, reduce only if viewport doesn't have enough space
        let placement: 'top' | 'bottom' = 'bottom';
        let maxHeight: number;

        // If currently placed at top, prefer to keep it there to avoid flipping during interactions (e.g. filtering)
        const currentPlacement = position?.placement;

        if (currentPlacement === 'top' && spaceAbove >= Math.min(naturalHeight + OFFSET, defaultMaxHeight)) {
            // Already at top and enough space above — stay at top
            placement = 'top';
            maxHeight = Math.min(spaceAbove, defaultMaxHeight);
        } else if (spaceBelow >= defaultMaxHeight) {
            // Enough space below for default max height
            placement = 'bottom';
            maxHeight = defaultMaxHeight;
        } else if (spaceBelow >= naturalHeight + OFFSET) {
            // Use below with reduced height
            placement = 'bottom';
            maxHeight = spaceBelow;
        } else if (spaceAbove >= defaultMaxHeight) {
            // Enough space above for default max height
            placement = 'top';
            maxHeight = defaultMaxHeight;
        } else if (spaceAbove > spaceBelow) {
            // More space above, use it with reduced height
            placement = 'top';
            maxHeight = spaceAbove;
        } else {
            // Default to bottom with whatever space is available
            placement = 'bottom';
            maxHeight = spaceBelow;
        }

        // When placement is 'top', ensure maxHeight doesn't exceed available space above
        if (placement === 'top') {
            maxHeight = Math.min(maxHeight, spaceAbove);
        }

        // Cap maxHeight by content's natural height (don't allocate more space than needed)
        maxHeight = Math.min(maxHeight, naturalHeight);

        // Calculate positions
        let top: number;
        if (placement === 'bottom') {
            top = triggerRect.bottom + OFFSET;
        } else {
            // Position above the trigger, ensuring we don't go above viewport
            top = Math.max(VIEWPORT_PADDING, triggerRect.top - maxHeight - OFFSET);
        }

        // Determine popover width
        let width: number | null = null;
        let popoverWidth: number;

        if (setToTargetWidth) {
            // Use the captured width to prevent shrinking when trigger content changes
            width = Math.max(triggerRect.width, capturedWidthRef.current || 0);
            popoverWidth = width;
        } else {
            // Measure the popover's natural content width
            const popoverEl = popoverRef.current;
            popoverWidth = popoverEl ? popoverEl.offsetWidth : triggerRect.width;
        }

        // Horizontal positioning: anchor to left edge of trigger by default
        let left = triggerRect.left;

        // If popover overflows the right edge, anchor to the right edge of the trigger instead
        if (left + popoverWidth > viewportWidth - VIEWPORT_PADDING) {
            left = triggerRect.right - popoverWidth;
        }

        // Final bounds check: ensure we don't go off-screen left
        if (left < VIEWPORT_PADDING) {
            left = VIEWPORT_PADDING;
        }

        setPosition({
            placement,
            maxHeight,
            top,
            left,
            width,
        });
        setIsVisible(true);
    }, [isOpen, setToTargetWidth, triggerRef, position]);

    // Calculate position on open
    useLayoutEffect(() => {
        if (!isOpen) {
            setPosition(null);
            setIsVisible(false);
            return;
        }

        // Delay calculation to allow content to render
        const rafId = requestAnimationFrame(() => {
            calculatePosition();
        });

        return () => cancelAnimationFrame(rafId);
    }, [isOpen, calculatePosition]);

    // Recalculate on resize
    useEffect(() => {
        if (!isOpen) return;

        const handleResize = () => calculatePosition();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, calculatePosition]);

    // Recalculate position when content size changes (e.g., filtering)
    useEffect(() => {
        if (!isOpen || !contentRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            calculatePosition();
        });

        resizeObserver.observe(contentRef.current);

        // MutationObserver to detect when children change (e.g., items added/removed by filtering).
        // ResizeObserver alone is insufficient: when content is constrained by maxHeight,
        // adding more items doesn't change the rendered box size, so ResizeObserver won't fire.
        const mutationObserver = new MutationObserver(() => {
            calculatePosition();
        });

        mutationObserver.observe(contentRef.current, {
            childList: true,
            subtree: true,
        });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [isOpen, calculatePosition]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === InteractionKeyCode.ESCAPE) {
                onDismiss();
                (triggerRef.current as HTMLElement)?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onDismiss, triggerRef]);

    // Click outside handling
    const popoverWithClickOutside = useClickOutside(
        useReflex<Element>(
            useCallback(
                (current, previous) => {
                    if (previous instanceof Element) {
                        (previous as any)[CONTROL_ELEMENT_PROPERTY] = undefined;
                        delete (previous as any)[CONTROL_ELEMENT_PROPERTY];
                    }
                    if (current instanceof Element) {
                        (current as any)[CONTROL_ELEMENT_PROPERTY] = triggerRef.current;
                    }
                },
                [triggerRef]
            ),
            popoverRef
        ),
        onDismiss,
        !isOpen,
        ClickOutsideVariant.POPOVER
    );

    // Focus trap
    const popoverWithFocusTrap = useFocusTrap(
        disableFocusTrap ? null : popoverWithClickOutside,
        useCallback(
            (interactionKeyPressed: boolean) => {
                onDismiss();
                if (interactionKeyPressed) {
                    (triggerRef.current as HTMLElement)?.focus();
                }
            },
            [onDismiss, triggerRef]
        )
    );

    // Final ref
    const finalRef = useReflex<Element>(
        useCallback(
            current => {
                if (current instanceof Element) {
                    (current as any)[CONTROL_ELEMENT_PROPERTY] = triggerRef.current;
                }
            },
            [triggerRef]
        ),
        disableFocusTrap ? popoverWithClickOutside : popoverWithFocusTrap
    );

    if (!isOpen) return null;

    const style: Record<string, string> = position
        ? {
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: position.width != null ? `${position.width}px` : 'auto',
              ...(position.width != null && { minWidth: `${position.width}px` }),
              visibility: isVisible ? 'visible' : 'hidden',
              zIndex: '1000',
          }
        : {
              position: 'fixed',
              visibility: 'hidden',
              zIndex: '1000',
          };

    const contentStyle: Record<string, string> = position
        ? {
              maxHeight: `${position.maxHeight}px`,
              overflowY: 'auto',
          }
        : {};

    return createPortal(
        <>
            {showOverlay && <div className="adyen-pe-select-popover__overlay" />}
            <div
                ref={elem => {
                    popoverRef.current = elem;
                    finalRef(elem);
                }}
                id={popoverId.current}
                className={classNames('adyen-pe-select-popover', position?.placement === 'top' && 'adyen-pe-select-popover--top', classNameModifiers)}
                style={style}
                role="listbox"
                aria-labelledby={triggerRef.current?.id}
            >
                <div ref={contentRef} className="adyen-pe-select-popover__content" style={contentStyle}>
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
};

export default SelectPopover;
