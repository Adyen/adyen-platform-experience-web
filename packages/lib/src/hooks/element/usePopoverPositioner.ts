import { PopoverContainerPosition } from '@src/components/internal/Popover/types';
import { MutableRef, useCallback, useState } from 'preact/hooks';
import useReflex, { Nullable, Reflexable } from '../useReflex';

const popoverPositions = [
    PopoverContainerPosition.BOTTOM,
    PopoverContainerPosition.TOP,
    PopoverContainerPosition.LEFT,
    PopoverContainerPosition.RIGHT,
];

const getCurrentPositionIterator = () => {
    let currentStep = 0;
    const getNext = {
        next() {
            if (currentStep === popoverPositions.length - 1) {
                return { value: PopoverContainerPosition.BOTTOM, done: true };
            }
            currentStep++;
            return { value: popoverPositions[currentStep], done: false };
        },
    };
    return getNext;
};

const calculateOffset = (
    popover: Element | null,
    offset: number[],
    targetElement: MutableRef<Element | null>,
    position?: PopoverContainerPosition
) => {
    if (offset.length < 3) {
        const oldLength = offset.length;
        offset.length = 3;
        offset.fill(0, oldLength, 3);
    }

    if (!position) {
        position = PopoverContainerPosition.BOTTOM;
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
    targetElement: MutableRef<Element | null>,
    position?: PopoverContainerPosition,
    ref?: Nullable<Reflexable<Element>>
) => {
    const [autoPosition, setAutoPosition] = useState(position);
    const observer: any = new IntersectionObserver(
        entries => {
            const iterator = getCurrentPositionIterator();
            entries.forEach(entry => {
                if (entry.intersectionRatio < 1) {
                    const newPosition = iterator.next();
                    setAutoPosition(newPosition.value);
                }
            });
        },
        { root: null, rootMargin: '', threshold: [1] }
    );

    return useReflex<Element>(
        useCallback(
            current => {
                observer.observe(current);
                if (!(current instanceof Element)) return;
                current.setAttribute(
                    'style',
                    `display: block; position: absolute;inset: 0 auto auto 0; margin: 0; z-index:10; transform: ${calculateOffset(
                        current,
                        offset,
                        targetElement,
                        autoPosition
                    )}`
                );
            },
            [ref, offset, targetElement, position, autoPosition]
        ),
        ref
    );
};

export default usePopoverPositioner;
