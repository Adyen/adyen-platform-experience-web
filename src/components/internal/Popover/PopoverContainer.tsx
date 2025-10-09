import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { PopoverContainerPosition, PopoverProps } from './types';
import Popover from './Popover';
import './Popover.scss';

function PopoverContainer(props: PropsWithChildren<Omit<PopoverProps, 'ref'>>) {
    const [_, setLastScrollCallbackTimestamp] = useState<DOMHighResTimeStamp>(performance.now());
    const [popoverStyle, setPopoverStyle] = useState<{ minY?: number; maxY?: number } | undefined>();

    const shouldTrackVerticalScrolling = useCallback(
        (element: Element | null): element is HTMLElement =>
            element && props.fixedPositioning ? element.scrollHeight > (element as HTMLElement).offsetHeight : false,
        [props.fixedPositioning]
    );

    const scrollElement = (props.targetElement.current as HTMLElement)?.offsetParent as HTMLElement | null;

    useEffect(() => {
        if (!shouldTrackVerticalScrolling(scrollElement)) return;

        const { height: scrollElementHeight, y: scrollElementY } = scrollElement.getBoundingClientRect();

        setPopoverStyle({
            minY: scrollElementY,
            maxY: scrollElementY + scrollElementHeight,
        });

        let rafId: ReturnType<typeof requestAnimationFrame> | null = null;

        const delayedCallback = () => {
            rafId && cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                rafId = null;
                // The last scroll callback timestamp is only updated here to
                // trigger a re-render of the component, allowing for layout
                // and style updates to be applied to the popover.
                setLastScrollCallbackTimestamp(performance.now());
            });
        };

        scrollElement.addEventListener('scroll', delayedCallback, { passive: true });

        return () => {
            scrollElement.removeEventListener('scroll', delayedCallback);
            rafId && cancelAnimationFrame(rafId);
            rafId = null;
        };
    }, [scrollElement, shouldTrackVerticalScrolling]);

    return props.fixedPositioning ? (
        // TODO: - Consider using same position from parent element
        //       - Consider adding position prop to components using Popover
        <Popover {...props} position={PopoverContainerPosition.BOTTOM} additionalStyle={popoverStyle} />
    ) : (
        <Popover {...props} />
    );
}

export default PopoverContainer;
