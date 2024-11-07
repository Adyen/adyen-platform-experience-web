import { add } from './utils';
import { enumerable } from '../../../../utils';
import { InteractionKeyCode } from '../../../types';
import { SpinButtonContext, SpinButtonContextElements, SpinButtonContextInteractions, SpinButtonValueOffset } from './types';

export const contextWithInteractions = <T extends SpinButtonContext & SpinButtonContextElements>(context: T) => {
    // Helper functions
    const stepDown = () => offsetValue(SpinButtonValueOffset.STEP_DECREMENT);
    const stepUp = () => offsetValue(SpinButtonValueOffset.STEP_INCREMENT);
    const leapDown = () => offsetValue(SpinButtonValueOffset.LEAP_DECREMENT);
    const leapUp = () => offsetValue(SpinButtonValueOffset.LEAP_INCREMENT);
    const setToMax = () => void (context.value = context.max);
    const setToMin = () => void (context.value = context.min);

    const offsetValue = (valueOffset = SpinButtonValueOffset.STEP_INCREMENT) => {
        let offset = context.step;

        switch (valueOffset) {
            case SpinButtonValueOffset.STEP_DECREMENT:
                offset *= -1;
                break;
            case SpinButtonValueOffset.LEAP_DECREMENT:
                offset *= -context.leap;
                break;
            case SpinButtonValueOffset.LEAP_INCREMENT:
                offset *= context.leap;
                break;
        }

        context.value = add(context.value, offset);
    };

    const preventDefaultEvent = (evt: KeyboardEvent | MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
    };

    const willHandleAsInteractionKey = (evt: KeyboardEvent) => {
        let willHandleInteraction = false;

        if (evt.type === 'keydown' && evt.currentTarget && evt.currentTarget === context.valueElement) {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                case InteractionKeyCode.END:
                case InteractionKeyCode.HOME:
                case InteractionKeyCode.PAGE_DOWN:
                case InteractionKeyCode.PAGE_UP:
                    willHandleInteraction = !context.disabled;
                    break;
            }

            switch (evt.code) {
                case InteractionKeyCode.END:
                    willHandleInteraction &&= Number.isFinite(context.max);
                    break;
                case InteractionKeyCode.HOME:
                    willHandleInteraction &&= Number.isFinite(context.min);
                    break;
            }
        }

        return willHandleInteraction;
    };

    // Main function for handling interaction keys
    const onInteractionKeyPress = (evt: KeyboardEvent) => {
        if (!willHandleAsInteractionKey(evt)) return;

        preventDefaultEvent(evt);

        switch (evt.code) {
            case InteractionKeyCode.ARROW_DOWN:
            case InteractionKeyCode.ARROW_LEFT:
                stepDown();
                break;
            case InteractionKeyCode.ARROW_RIGHT:
            case InteractionKeyCode.ARROW_UP:
                stepUp();
                break;
            case InteractionKeyCode.END:
                setToMax();
                break;
            case InteractionKeyCode.HOME:
                setToMin();
                break;
            case InteractionKeyCode.PAGE_DOWN:
                leapDown();
                break;
            case InteractionKeyCode.PAGE_UP:
                leapUp();
                break;
        }
    };

    // Main function for button click interactions
    const onButtonClick = (evt: MouseEvent) => {
        if (evt.type !== 'click') return;
        if (evt.currentTarget === context.decrementButton && !context.decrementDisabled) {
            preventDefaultEvent(evt);
            stepDown();
        } else if (evt.currentTarget === context.incrementButton && !context.incrementDisabled) {
            preventDefaultEvent(evt);
            stepUp();
        }
    };

    return Object.defineProperties(context as T & SpinButtonContextInteractions, {
        onButtonClick: enumerable(onButtonClick),
        onInteractionKeyPress: enumerable(onInteractionKeyPress),
    });
};

export default contextWithInteractions;
