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
    NON_TABBABLE_TAB_INDEX,
    ROLE_SPIN_BUTTON,
    TABBABLE_TAB_INDEX,
} from './constants';
import { add, attr, removeAttr } from './utils';
import { boolOrFalse, clamp } from '../../../../utils';
import { InteractionKeyCode } from '../../../types';
import { SpinButtonValueOffset } from './types';

export default class SpinButton {
    private _decrementElem: HTMLElement | null = null;
    private _incrementElem: HTMLElement | null = null;
    private _spinButtonElem: HTMLElement | null = null;

    private _disabled = false;
    private _interactingWithKeyboard = false;
    private _interactingWithMouse = false;

    private _onChange?: (value: number) => unknown;
    private _rafId!: ReturnType<typeof requestAnimationFrame>;

    private _valueMin = 0;
    private _valueMax = 100;
    private _valueNow = 0;
    private _valueStep = 1;
    private _valueStepScale = 10;

    constructor() {
        this.handleKeyboardInteraction = this.handleKeyboardInteraction.bind(this);
        this.handleMouseInteraction = this.handleMouseInteraction.bind(this);
        this.startInteraction = this.startInteraction.bind(this);
    }

    private get _decrementDisabled() {
        return this._disabled || this._valueNow === this._valueMin;
    }

    private get _incrementDisabled() {
        return this._disabled || this._valueNow === this._valueMax;
    }

    private set _value(value: number) {
        const nextValue = clamp(this._valueMin, value, this._valueMax);

        if (this._valueNow !== (this._valueNow = nextValue)) {
            this._updateStepElemDisability(this._decrementElem, this._decrementDisabled);
            this._updateStepElemDisability(this._incrementElem, this._incrementDisabled);
            this._updateValueNowAttribute();
            this._propagateCurrentState();
        }
    }

    private _valueOffset(valueOffset = SpinButtonValueOffset.STEP_INCREMENT) {
        let offset = this._valueStep;

        switch (valueOffset) {
            case SpinButtonValueOffset.LEAP_DECREMENT:
            case SpinButtonValueOffset.STEP_DECREMENT:
                offset *= -1;
                break;
        }

        switch (valueOffset) {
            case SpinButtonValueOffset.LEAP_DECREMENT:
            case SpinButtonValueOffset.LEAP_INCREMENT:
                offset *= this._valueStepScale;
                break;
        }

        this._value = add(this._valueNow, offset);
    }

    private _preserveFocusState() {
        cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(() => this._spinButtonElem?.focus());
    }

    private _propagateCurrentState() {
        this._onChange?.(this._valueNow);
    }

    private _initSpinButtonElemAttributes(current: HTMLElement | null, next: HTMLElement | null) {
        ATTRS_SPIN_BUTTON.forEach(attr => removeAttr(current, attr));
        attr(next, ATTR_ROLE, ROLE_SPIN_BUTTON);
        this._updateSpinButtonElemDisability(next);
        this._updateValueNowAttribute(next);
        this._updateValueMinAttribute(next);
        this._updateValueMaxAttribute(next);
    }

    private _initStepElemAttributes(current: HTMLElement | null, next: HTMLElement | null, disabled: boolean) {
        ATTRS_STEP_CONTROL.forEach(attr => removeAttr(current, attr));
        attr(next, ATTR_TAB_INDEX, NON_TABBABLE_TAB_INDEX);
        this._updateStepElemDisability(next, disabled);
    }

    private _updateSpinButtonElemDisability(elem = this._spinButtonElem) {
        if (this._disabled) {
            attr(elem, ATTR_ARIA_DISABLED, 'true');
            removeAttr(elem, ATTR_TAB_INDEX);
            document.body.focus();
        } else {
            removeAttr(elem, ATTR_ARIA_DISABLED);
            attr(elem, ATTR_TAB_INDEX, TABBABLE_TAB_INDEX);
        }
    }

    private _updateStepElemDisability(elem: HTMLElement | null, disabled: boolean) {
        disabled ? attr(elem, ATTR_DISABLED, ATTR_DISABLED) : removeAttr(elem, ATTR_DISABLED);
    }

    private _updateValueMaxAttribute(elem = this._spinButtonElem) {
        attr(elem, ATTR_ARIA_VALUE_MAX, `${this._valueMax}`);
    }

    private _updateValueMinAttribute(elem = this._spinButtonElem) {
        attr(elem, ATTR_ARIA_VALUE_MIN, `${this._valueMin}`);
    }

    private _updateValueNowAttribute(elem = this._spinButtonElem) {
        attr(elem, ATTR_ARIA_VALUE_NOW, `${this._valueNow}`);
    }

    private _handlingInteraction(evt: Event) {
        evt.preventDefault();
        this._preserveFocusState();
    }

    private _willHandleAsInteraction(evt: Event) {
        return !!evt.currentTarget && evt.currentTarget === this._spinButtonElem && !this._disabled;
    }

    private _willHandleAsKeyboardInteraction(evt: KeyboardEvent) {
        if (evt.type === 'keydown') {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                case InteractionKeyCode.END:
                case InteractionKeyCode.HOME:
                case InteractionKeyCode.PAGE_DOWN:
                case InteractionKeyCode.PAGE_UP:
                    return this._willHandleAsInteraction(evt);
            }
        }
        return false;
    }

    private _willHandleAsMouseInteraction(evt: MouseEvent) {
        if (evt.type === 'click' && evt.target) {
            switch (evt.target) {
                case this._decrementElem:
                case this._incrementElem:
                    return this._willHandleAsInteraction(evt);
            }
        }
        return false;
    }

    private _willInterceptEvent(evt: Event) {
        let elem = evt.target as Element;
        while (elem) {
            if (elem === this._spinButtonElem) return true;
            elem = elem?.parentElement!;
        }
        return false;
    }

    set disabled(value: boolean | undefined | null) {
        if (this._disabled !== (this._disabled = boolOrFalse(value))) {
            this._updateSpinButtonElemDisability();
            this._updateStepElemDisability(this._decrementElem, this._decrementDisabled);
            this._updateStepElemDisability(this._incrementElem, this._incrementDisabled);
            this._interactingWithKeyboard = this._interactingWithMouse = false;
        }
    }

    set decrementElem(elem: HTMLElement | null) {
        this._initStepElemAttributes(this._decrementElem, elem, this._decrementDisabled);
        this._decrementElem = elem;
    }

    set incrementElem(elem: HTMLElement | null) {
        this._initStepElemAttributes(this._incrementElem, elem, this._incrementDisabled);
        this._incrementElem = elem;
    }

    set spinButtonElem(elem: HTMLElement | null) {
        this._initSpinButtonElemAttributes(this._spinButtonElem, elem);
        this._spinButtonElem = elem;
    }

    set onChange(value: ((value: number) => unknown) | undefined | null) {
        if (this._onChange !== (this._onChange = value ?? undefined)) this._propagateCurrentState();
    }

    handleKeyboardInteraction(evt: KeyboardEvent) {
        if (this._willHandleAsKeyboardInteraction(evt) && this._interactingWithKeyboard && !(this._interactingWithKeyboard = false)) {
            this._handlingInteraction(evt);

            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                    this._valueOffset(SpinButtonValueOffset.STEP_DECREMENT);
                    break;
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                    this._valueOffset(SpinButtonValueOffset.STEP_INCREMENT);
                    break;
                case InteractionKeyCode.END:
                    this._value = this._valueMax;
                    break;
                case InteractionKeyCode.HOME:
                    this._value = this._valueMin;
                    break;
                case InteractionKeyCode.PAGE_DOWN:
                    this._valueOffset(SpinButtonValueOffset.LEAP_DECREMENT);
                    break;
                case InteractionKeyCode.PAGE_UP:
                    this._valueOffset(SpinButtonValueOffset.LEAP_INCREMENT);
                    break;
            }
        }
    }

    handleMouseInteraction(evt: MouseEvent) {
        if (this._willHandleAsMouseInteraction(evt) && this._interactingWithMouse && !(this._interactingWithMouse = false)) {
            this._handlingInteraction(evt);

            switch (evt.target) {
                case this._decrementElem:
                    this._valueOffset(SpinButtonValueOffset.STEP_DECREMENT);
                    break;
                case this._incrementElem:
                    this._valueOffset(SpinButtonValueOffset.STEP_INCREMENT);
                    break;
            }
        }
    }

    startInteraction(evt: Event) {
        const startingInteraction = evt.eventPhase === Event.AT_TARGET || evt.eventPhase === Event.CAPTURING_PHASE;

        if (this._willHandleAsKeyboardInteraction(evt as KeyboardEvent)) {
            this._interactingWithKeyboard = startingInteraction;
        } else if (this._willHandleAsMouseInteraction(evt as MouseEvent)) {
            this._interactingWithMouse = startingInteraction;
        } else if (this._willInterceptEvent(evt) && this._disabled) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
        }
    }
}
