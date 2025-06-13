import { PropsWithChildren, useEffect, useRef } from 'preact/compat';
import { useState } from 'preact/hooks';
import './Popover.scss';
import Popover from './Popover';
import { PopoverContainerPosition, PopoverProps } from './types';

function PopoverContainer(props: PropsWithChildren<Omit<PopoverProps, 'ref'>>) {
    const targetElement = props.targetElement;
    const scrollElement = (targetElement.current as HTMLElement)?.offsetParent as HTMLElement;
    const [popoverStyle, setPopoverStyle] = useState<{ minY?: number; maxY?: number } | undefined>();
    const [isScrollable] = useState(scrollElement?.scrollHeight > scrollElement?.offsetHeight);
    const [, setToggle] = useState<boolean>(false);
    const rafIdRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
    const skipHScrollListener = !scrollElement || !isScrollable || !props.fixedPositioning;

    useEffect(() => {
        if (skipHScrollListener) return;

        const scrollElementPosition = scrollElement?.getBoundingClientRect();

        if (scrollElementPosition.y) {
            setPopoverStyle({ minY: scrollElementPosition.y, maxY: scrollElementPosition?.height + scrollElementPosition?.y });
        }

        const scrollCallback = () => {
            setToggle((prev: boolean) => !prev);
        };

        const delayedCallback = () => {
            rafIdRef.current && cancelAnimationFrame(rafIdRef.current);

            rafIdRef.current = requestAnimationFrame(() => {
                rafIdRef.current = null;
                scrollCallback();
            });
        };

        scrollElement.addEventListener('scroll', delayedCallback, { passive: true });

        return () => {
            scrollElement.removeEventListener('scroll', delayedCallback);
            rafIdRef.current && cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        };
    }, []);

    if (!props.fixedPositioning) {
        return <Popover {...props}>{props.children}</Popover>;
    }

    /*
     * TODO: - Consider using same position from parent element
     *       - Consider adding position prop to components using Popover
     */
    return (
        <Popover {...props} position={PopoverContainerPosition.BOTTOM} additionalStyle={popoverStyle}>
            {props.children}
        </Popover>
    );
}
export default PopoverContainer;
