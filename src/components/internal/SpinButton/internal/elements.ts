import {
    ATTR_ARIA_DISABLED,
    ATTR_ARIA_VALUE_MAX,
    ATTR_ARIA_VALUE_MIN,
    ATTR_ARIA_VALUE_NOW,
    ATTR_DISABLED,
    ATTR_ROLE,
    ATTR_TAB_INDEX,
    ATTRS_SPIN_BUTTON,
    ATTRS_STEP_CONTROL,
    EVENT_STATE_NOTIFICATION,
    NON_TABBABLE_TAB_INDEX,
    ROLE_SPIN_BUTTON,
    TABBABLE_TAB_INDEX,
} from './constants';
import { removeAttr, setAttr } from './utils';
import { getter } from '../../../../utils';
import type { SpinButtonContext, SpinButtonContextElements } from './types';

export const contextWithElements = <T extends SpinButtonContext>(context: T) => {
    let containerElement: HTMLElement | null = null;
    let decrementButton: HTMLButtonElement | null = null;
    let incrementButton: HTMLButtonElement | null = null;
    let valueElement: HTMLElement | null = null;
    let raf: ReturnType<typeof requestAnimationFrame> | null = null;

    const keepFocusOnValueElement = () => {
        if (context.disabled) return;
        if (raf) cancelAnimationFrame(raf);

        raf = requestAnimationFrame(() => {
            raf = null;
            valueElement?.focus();
        });
    };

    const setContainerElement = (elem: HTMLElement | null) => {
        containerElement?.removeEventListener('pointerdown', keepFocusOnValueElement, true);
        (containerElement = elem)?.addEventListener('pointerdown', keepFocusOnValueElement, true);
    };

    const setDecrementButton = (elem: HTMLButtonElement | null) => {
        clearButtonElementAttributes(decrementButton);
        initializeButtonElementAttributes((decrementButton = elem), context.decrementDisabled);
    };

    const setIncrementButton = (elem: HTMLButtonElement | null) => {
        clearButtonElementAttributes(incrementButton);
        initializeButtonElementAttributes((incrementButton = elem), context.incrementDisabled);
    };

    const setValueElement = (elem: HTMLElement | null) => {
        ATTRS_SPIN_BUTTON.forEach(attr => removeAttr(valueElement, attr));
        setAttr((valueElement = elem), ATTR_ROLE, ROLE_SPIN_BUTTON);
        updateValueElementAttributes();
    };

    const clearButtonElementAttributes = (elem: HTMLButtonElement | null) => {
        ATTRS_STEP_CONTROL.forEach(attr => removeAttr(elem, attr));
    };

    const initializeButtonElementAttributes = (elem: HTMLButtonElement | null, disabled: boolean) => {
        setAttr(elem, ATTR_TAB_INDEX, NON_TABBABLE_TAB_INDEX);
        updateButtonElementAttributes(elem, disabled);
    };

    const updateButtonElementAttributes = (elem: HTMLButtonElement | null, disabled: boolean) => {
        disabled ? setAttr(elem, ATTR_DISABLED, '') : removeAttr(elem, ATTR_DISABLED);
    };

    const updateValueElementAttributes = () => {
        if (context.disabled) {
            setAttr(valueElement, ATTR_ARIA_DISABLED, 'true');
            setAttr(valueElement, ATTR_DISABLED, '');
            removeAttr(valueElement, ATTR_TAB_INDEX);
        } else {
            removeAttr(valueElement, ATTR_ARIA_DISABLED);
            removeAttr(valueElement, ATTR_DISABLED);
            setAttr(valueElement, ATTR_TAB_INDEX, TABBABLE_TAB_INDEX);
        }

        setAttr(valueElement, ATTR_ARIA_VALUE_MAX, `${context.max}`);
        setAttr(valueElement, ATTR_ARIA_VALUE_MIN, `${context.min}`);
        setAttr(valueElement, ATTR_ARIA_VALUE_NOW, `${context.value}`);
    };

    context.addEventListener(
        EVENT_STATE_NOTIFICATION,
        () => {
            updateButtonElementAttributes(decrementButton, context.decrementDisabled);
            updateButtonElementAttributes(incrementButton, context.incrementDisabled);
            updateValueElementAttributes();
        },
        { signal: context.signal }
    );

    return Object.defineProperties(context as T & SpinButtonContextElements, {
        containerElement: { ...getter(() => containerElement), set: setContainerElement },
        decrementButton: { ...getter(() => decrementButton), set: setDecrementButton },
        incrementButton: { ...getter(() => incrementButton), set: setIncrementButton },
        valueElement: { ...getter(() => valueElement), set: setValueElement },
    });
};

export default contextWithElements;
