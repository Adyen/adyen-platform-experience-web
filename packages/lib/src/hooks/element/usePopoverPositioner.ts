import { PopoverContainerPosition } from '@src/components/internal/Popover/types';
import { useCallback } from 'preact/hooks';
import useReflex, { NullableReflexable } from '../useReflex';

const usePopoverPositioner = (offset: any, position: any, targetElement: any, ref?: NullableReflexable<Element>) => {
    const calculateOffset = (popover: Element | null) => {
        if (offset.length < 3) {
            const oldLength = offset.length;
            offset.length = 3;
            offset.fill(0, oldLength, 3);
        }

        let dimensionX = 0;
        let dimensionY = 0;
        let dimensionZ = 0;
        const targetPosition = targetElement?.current;
        switch (position) {
            case PopoverContainerPosition.BOTTOM:
                dimensionX = targetPosition?.offsetLeft + offset[0];
                dimensionY = targetPosition.offsetTop + targetPosition.offsetHeight + offset[1];
                dimensionZ = offset[2];
                break;
            case PopoverContainerPosition.TOP:
                dimensionX = targetElement?.current?.offsetLeft + offset[0];
                dimensionY = popover?.clientHeight ? targetElement?.current?.offsetTop - offset[1] - popover?.clientHeight : 0;
                dimensionZ = offset[2];
                break;
            case PopoverContainerPosition.RIGHT:
                dimensionX = targetElement?.current?.offsetLeft + targetElement?.current?.offsetWidth + offset[0];
                dimensionY = targetElement?.current?.offsetTop + offset[1];
                dimensionZ = offset[2];
                break;
            case PopoverContainerPosition.LEFT:
                dimensionX = popover?.clientWidth ? targetElement?.current?.offsetLeft - popover?.clientWidth - offset[0] : 0;
                dimensionY = targetElement?.current?.offsetTop + offset[1];
                dimensionZ = offset[2];
                break;
        }

        const result = [dimensionX, dimensionY, dimensionZ];

        return result.reduce(
            (acc, currentVal, index) => (index === offset.length - 1 ? acc + ` ${currentVal}px)` : acc + ` ${currentVal}px,`),
            'translate3d('
        );
    };

    return useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;
                current.setAttribute('style', `position: absolute;inset: 0 auto auto 0; margin: 0; zIndex:5; transform: ${calculateOffset(current)}`);
            },
            [ref]
        ),
        ref
    );
};

export default usePopoverPositioner;
