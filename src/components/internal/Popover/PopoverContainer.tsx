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
    const [toggle, setToggle] = useState<boolean>(false);
    const debounceTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
            debounceTimeoutIdRef.current && clearTimeout(debounceTimeoutIdRef.current);

            debounceTimeoutIdRef.current = setTimeout(() => {
                requestAnimationFrame(() => scrollCallback());

                debounceTimeoutIdRef.current = null;
            }, 100);
        };

        scrollElement.addEventListener('scroll', delayedCallback);

        return () => {
            scrollElement.removeEventListener('scroll', delayedCallback);
            debounceTimeoutIdRef.current && clearTimeout(debounceTimeoutIdRef.current);
        };
    }, []);

    if (!props.fixedPositioning) {
        return <Popover {...props}>{props.children}</Popover>;
    }

    return (
        <Popover {...props} position={PopoverContainerPosition.BOTTOM} additionalStyle={popoverStyle}>
            {props.children}
        </Popover>
    );
}
export default PopoverContainer;
