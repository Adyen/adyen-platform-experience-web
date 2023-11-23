import { PopoverContainerPosition } from '@src/components/internal/Popover/types';
import { MutableRef, useCallback } from 'preact/hooks';
import useReflex, { NullableReflexable } from '../useReflex';

const calculateOffset = (
    popover: Element | null,
    offset: number[],
    targetElement: MutableRef<Element | null>,
    position: PopoverContainerPosition
) => {
    if (offset.length < 3) {
        const oldLength = offset.length;
        offset.length = 3;
        offset.fill(0, oldLength, 3);
    }

    let dimensionX = 0;
    let dimensionY = 0;
    let dimensionZ = 0;
    const currentTarget = targetElement?.current as HTMLElement;
    switch (position) {
        case PopoverContainerPosition.BOTTOM:
            dimensionX = currentTarget?.offsetLeft + offset[0]!;
            dimensionY = currentTarget?.offsetTop + currentTarget?.offsetHeight + offset[1]!;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.TOP:
            dimensionX = currentTarget?.offsetLeft + offset[0]!;
            dimensionY = popover?.clientHeight ? currentTarget?.offsetTop - offset[1]! - popover?.clientHeight : 0;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.RIGHT:
            dimensionX = currentTarget?.offsetLeft + currentTarget?.offsetWidth + offset[0]!;
            dimensionY = currentTarget?.offsetTop + offset[1]!;
            dimensionZ = offset[2]!;
            break;
        case PopoverContainerPosition.LEFT:
            dimensionX = popover?.clientWidth ? currentTarget?.offsetLeft - popover?.clientWidth - offset[0]! : 0;
            dimensionY = currentTarget?.offsetTop + offset[1]!;
            dimensionZ = offset[2]!;
            break;
    }

    const result = [dimensionX, dimensionY, dimensionZ];

    return result.reduce(
        (acc, currentVal, index) => (index === offset.length - 1 ? acc + ` ${currentVal}px)` : acc + ` ${currentVal}px,`),
        'translate3d('
    );
};
const usePopoverPositioner = (
    offset: number[],
    position: PopoverContainerPosition,
    targetElement: MutableRef<Element | null>,
    ref?: NullableReflexable<Element>
) => {
    return useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;
                current.setAttribute(
                    'style',
                    `position: absolute;inset: 0 auto auto 0; margin: 0; zIndex:5; transform: ${calculateOffset(
                        current,
                        offset,
                        targetElement,
                        position
                    )}`
                );
            },
            [ref, offset, targetElement, position]
        ),
        ref
    );
};

export default usePopoverPositioner;
