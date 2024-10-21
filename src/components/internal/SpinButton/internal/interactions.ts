import { add } from './utils';
import { enumerable } from '../../../../utils';
import { InteractionKeyCode } from '../../../types';
import { SpinButtonContext, SpinButtonContextElements, SpinButtonContextInteractions, SpinButtonValueOffset } from './types';

export const contextWithInteractions = <T extends SpinButtonContext & SpinButtonContextElements>(context: T) => {
    const beforeHandlingInteraction = (evt: KeyboardEvent | MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
    };

    const offsetValue = (valueOffset = SpinButtonValueOffset.STEP_INCREMENT) => {
        let offset = context.step;

        switch (valueOffset) {
            case SpinButtonValueOffset.LEAP_DECREMENT:
            case SpinButtonValueOffset.STEP_DECREMENT:
                offset *= -1;
                break;
        }

        switch (valueOffset) {
            case SpinButtonValueOffset.LEAP_DECREMENT:
            case SpinButtonValueOffset.LEAP_INCREMENT:
                offset *= context.leap;
                break;
        }

        context.value = add(context.value, offset);
    };

    const willHandleAsKeyboardInteraction = (evt: KeyboardEvent) => {
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
                    return !context.disabled;
            }
        }
        return false;
    };

    const onKeyboardInteraction = (evt: KeyboardEvent) => {
        if (willHandleAsKeyboardInteraction(evt)) {
            beforeHandlingInteraction(evt);

            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                    offsetValue(SpinButtonValueOffset.STEP_DECREMENT);
                    break;
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                    offsetValue(SpinButtonValueOffset.STEP_INCREMENT);
                    break;
                case InteractionKeyCode.END:
                    context.value = context.max;
                    break;
                case InteractionKeyCode.HOME:
                    context.value = context.min;
                    break;
                case InteractionKeyCode.PAGE_DOWN:
                    offsetValue(SpinButtonValueOffset.LEAP_DECREMENT);
                    break;
                case InteractionKeyCode.PAGE_UP:
                    offsetValue(SpinButtonValueOffset.LEAP_INCREMENT);
                    break;
            }
        }
    };

    const willHandleAsMouseInteraction = (evt: MouseEvent) => {
        if (evt.type === 'click' && evt.currentTarget) {
            switch (evt.currentTarget) {
                case context.decrementButton:
                    return !context.decrementDisabled;
                case context.incrementButton:
                    return !context.incrementDisabled;
            }
        }
        return false;
    };

    const onMouseInteraction = (evt: MouseEvent) => {
        if (willHandleAsMouseInteraction(evt)) {
            beforeHandlingInteraction(evt);

            switch (evt.currentTarget) {
                case context.decrementButton:
                    offsetValue(SpinButtonValueOffset.STEP_DECREMENT);
                    break;
                case context.incrementButton:
                    offsetValue(SpinButtonValueOffset.STEP_INCREMENT);
                    break;
            }
        }
    };

    return Object.defineProperties(context as T & SpinButtonContextInteractions, {
        keyboardInteraction: enumerable(onKeyboardInteraction),
        mouseInteraction: enumerable(onMouseInteraction),
    });
};

export default contextWithInteractions;
