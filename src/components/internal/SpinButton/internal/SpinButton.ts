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
    DEFAULT_VALUE_LEAP,
    DEFAULT_VALUE_MAX,
    DEFAULT_VALUE_MIN,
    DEFAULT_VALUE_NOW,
    DEFAULT_VALUE_STEP,
    NON_TABBABLE_TAB_INDEX,
    ROLE_SPIN_BUTTON,
    TABBABLE_TAB_INDEX,
} from './constants';
import { ALREADY_RESOLVED_PROMISE, asPlainObject, boolOrFalse, clamp, EMPTY_OBJECT, isUndefined } from '../../../../utils';
import { SpinButtonCalibrationProps, SpinButtonState, SpinButtonValueOffset } from './types';
import { InteractionKeyCode } from '../../../types';
import { add, attr, divide, removeAttr } from './utils';

export default class SpinButton {
    private _containerElement: HTMLElement | null = null;
    private _decrementButton: HTMLButtonElement | null = null;
    private _incrementButton: HTMLButtonElement | null = null;
    private _spinButtonElement: HTMLElement | null = null;

    private _disabled = false;
    private _onChange?: (currentState: SpinButtonState) => unknown;
    private _raf?: ReturnType<typeof requestAnimationFrame>;
    private _synchronizePending = false;

    private _valueLeap = DEFAULT_VALUE_LEAP;
    private _valueMax = DEFAULT_VALUE_MAX;
    private _valueMin = DEFAULT_VALUE_MIN;
    private _valueNow = DEFAULT_VALUE_NOW;
    private _valueStep = DEFAULT_VALUE_STEP;

    constructor() {
        this._ensureFocusIsPreserved = this._ensureFocusIsPreserved.bind(this);
        this.onKeyboardInteraction = this.onKeyboardInteraction.bind(this);
        this.onMouseInteraction = this.onMouseInteraction.bind(this);
    }

    private get _decrementButtonDisabled() {
        return this._disabled || this._valueNow === this._valueMin;
    }

    private get _incrementButtonDisabled() {
        return this._disabled || this._valueNow === this._valueMax;
    }

    private set _value(value: number) {
        const nextValue = clamp(this._valueMin, value, this._valueMax);
        if (this._valueNow !== (this._valueNow = nextValue)) this._synchronize();
    }

    private _beforeHandlingInteraction(evt: KeyboardEvent | MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    private _ensureFocusIsPreserved() {
        if (this._disabled) return;
        if (this._raf) cancelAnimationFrame(this._raf);

        this._raf = requestAnimationFrame(() => {
            this._raf = undefined;
            this._spinButtonElement?.focus();
        });
    }

    private _offsetValue(valueOffset = SpinButtonValueOffset.STEP_INCREMENT) {
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
                offset *= this._valueLeap;
                break;
        }

        this._value = add(this._valueNow, offset);
    }

    private _recalibrateRange(min?: number, max?: number): readonly [number, number] {
        const hasMin = !isUndefined(min);
        const hasMax = !isUndefined(max);

        if (hasMin && hasMax) return [min, min > max ? Math.max(min, DEFAULT_VALUE_MAX) : max] as const;
        if (hasMin) return [min, Math.max(min, DEFAULT_VALUE_MAX)] as const;
        if (hasMax) return [Math.min(max, DEFAULT_VALUE_MIN), max] as const;

        return [DEFAULT_VALUE_MIN, DEFAULT_VALUE_MAX] as const;
    }

    private _setupSpinButtonElement(current: HTMLElement | null, next: HTMLElement | null) {
        ATTRS_SPIN_BUTTON.forEach(attr => removeAttr(current, attr));
        attr(next, ATTR_ROLE, ROLE_SPIN_BUTTON);
        this._updateSpinButtonElementDisability(next);
        this._updateValueNowAttribute(next);
        this._updateValueMinAttribute(next);
        this._updateValueMaxAttribute(next);
    }

    private _setupStepButton(current: HTMLButtonElement | null, next: HTMLButtonElement | null, disabled: boolean) {
        ATTRS_STEP_CONTROL.forEach(attr => removeAttr(current, attr));
        attr(next, ATTR_TAB_INDEX, NON_TABBABLE_TAB_INDEX);
        this._updateStepButtonDisability(next, disabled);
    }

    private _synchronize() {
        if (!this._synchronizePending) {
            this._synchronizePending = true;

            ALREADY_RESOLVED_PROMISE.then(() => {
                this._synchronizePending = false;

                this._onChange?.({
                    disabled: this._disabled,
                    decrementButtonDisabled: this._decrementButtonDisabled,
                    incrementButtonDisabled: this._incrementButtonDisabled,
                    leap: this._valueLeap,
                    max: this._valueMax,
                    min: this._valueMin,
                    step: this._valueStep,
                    value: this._valueNow,
                });
            });
        }

        this._updateDecrementButtonDisability();
        this._updateIncrementButtonDisability();
        this._updateValueNowAttribute();
    }

    private _updateDecrementButtonDisability(elem = this._decrementButton) {
        this._updateStepButtonDisability(elem, this._decrementButtonDisabled);
    }

    private _updateIncrementButtonDisability(elem = this._incrementButton) {
        this._updateStepButtonDisability(elem, this._incrementButtonDisabled);
    }

    private _updateSpinButtonElementDisability(elem = this._spinButtonElement) {
        if (this._disabled) {
            attr(elem, ATTR_ARIA_DISABLED, 'true');
            attr(elem, ATTR_DISABLED, '');
            removeAttr(elem, ATTR_TAB_INDEX);
        } else {
            removeAttr(elem, ATTR_ARIA_DISABLED);
            removeAttr(elem, ATTR_DISABLED);
            attr(elem, ATTR_TAB_INDEX, TABBABLE_TAB_INDEX);
        }
    }

    private _updateStepButtonDisability(elem: HTMLButtonElement | null, disabled: boolean) {
        disabled ? attr(elem, ATTR_DISABLED, '') : removeAttr(elem, ATTR_DISABLED);
    }

    private _updateValueMaxAttribute(elem = this._spinButtonElement) {
        attr(elem, ATTR_ARIA_VALUE_MAX, `${this._valueMax}`);
    }

    private _updateValueMinAttribute(elem = this._spinButtonElement) {
        attr(elem, ATTR_ARIA_VALUE_MIN, `${this._valueMin}`);
    }

    private _updateValueNowAttribute(elem = this._spinButtonElement) {
        attr(elem, ATTR_ARIA_VALUE_NOW, `${this._valueNow}`);
    }

    private _willHandleAsKeyboardInteraction(evt: KeyboardEvent) {
        if (evt.type === 'keydown' && evt.currentTarget && evt.currentTarget === this._spinButtonElement) {
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                case InteractionKeyCode.END:
                case InteractionKeyCode.HOME:
                case InteractionKeyCode.PAGE_DOWN:
                case InteractionKeyCode.PAGE_UP:
                    return !this._disabled;
            }
        }
        return false;
    }

    private _willHandleAsMouseInteraction(evt: MouseEvent) {
        if (evt.type === 'click' && evt.currentTarget) {
            switch (evt.currentTarget) {
                case this._decrementButton:
                    return !this._decrementButtonDisabled;
                case this._incrementButton:
                    return !this._incrementButtonDisabled;
            }
        }
        return false;
    }

    set containerElement(elem: HTMLElement | null) {
        this._containerElement?.removeEventListener('pointerdown', this._ensureFocusIsPreserved, true);
        (this._containerElement = elem)?.addEventListener('pointerdown', this._ensureFocusIsPreserved, true);
    }

    set decrementButton(elem: HTMLButtonElement | null) {
        this._setupStepButton(this._decrementButton, elem, this._decrementButtonDisabled);
        this._decrementButton = elem;
    }

    set disabled(value: boolean | undefined | null) {
        if (this._disabled !== (this._disabled = boolOrFalse(value))) {
            this._updateSpinButtonElementDisability();
            this._updateDecrementButtonDisability();
            this._updateIncrementButtonDisability();
        }
    }

    set incrementButton(elem: HTMLButtonElement | null) {
        this._setupStepButton(this._incrementButton, elem, this._incrementButtonDisabled);
        this._incrementButton = elem;
    }

    set spinButtonElement(elem: HTMLElement | null) {
        this._setupSpinButtonElement(this._spinButtonElement, elem);
        this._spinButtonElement = elem;
    }

    set onChange(value: ((currentState: SpinButtonState) => unknown) | undefined | null) {
        if (this._onChange !== (this._onChange = value ?? undefined)) this._synchronize();
    }

    recalibrate(options = EMPTY_OBJECT as SpinButtonCalibrationProps) {
        let { leap, max, min, step, value } = asPlainObject(options);
        let shouldSynchronizeChanges = false;

        // recalibrate range
        [min, max] = this._recalibrateRange(min, max);

        if (this._valueMin !== (this._valueMin = min)) shouldSynchronizeChanges ||= true;
        if (this._valueMax !== (this._valueMax = max)) shouldSynchronizeChanges ||= true;

        // recalibrate step
        step = Math.max(0, step ?? DEFAULT_VALUE_STEP) || DEFAULT_VALUE_STEP;
        leap = isUndefined(leap) ? 0 : Math.max(0, Math.trunc(leap));

        if (this._valueStep !== (this._valueStep = step)) shouldSynchronizeChanges ||= true;
        if (this._valueLeap !== (this._valueLeap = leap)) shouldSynchronizeChanges ||= true;

        // recalibrate value
        const rangeMidValue = add(min, divide(add(max, -min), 2));
        const rangeFallbackValue = add(min, Math.round(divide(add(rangeMidValue, -min), step)) * step);
        value = clamp(min, value ?? rangeFallbackValue, max);

        if (this._valueNow !== value) {
            shouldSynchronizeChanges ||= true;
            this._value = value;
        }

        if (shouldSynchronizeChanges) this._synchronize();
    }

    onKeyboardInteraction(evt: KeyboardEvent) {
        if (this._willHandleAsKeyboardInteraction(evt)) {
            this._beforeHandlingInteraction(evt);

            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_LEFT:
                    this._offsetValue(SpinButtonValueOffset.STEP_DECREMENT);
                    break;
                case InteractionKeyCode.ARROW_RIGHT:
                case InteractionKeyCode.ARROW_UP:
                    this._offsetValue(SpinButtonValueOffset.STEP_INCREMENT);
                    break;
                case InteractionKeyCode.END:
                    this._value = this._valueMax;
                    break;
                case InteractionKeyCode.HOME:
                    this._value = this._valueMin;
                    break;
                case InteractionKeyCode.PAGE_DOWN:
                    this._offsetValue(SpinButtonValueOffset.LEAP_DECREMENT);
                    break;
                case InteractionKeyCode.PAGE_UP:
                    this._offsetValue(SpinButtonValueOffset.LEAP_INCREMENT);
                    break;
            }
        }
    }

    onMouseInteraction(evt: MouseEvent) {
        if (this._willHandleAsMouseInteraction(evt)) {
            this._beforeHandlingInteraction(evt);

            switch (evt.currentTarget) {
                case this._decrementButton:
                    this._offsetValue(SpinButtonValueOffset.STEP_DECREMENT);
                    break;
                case this._incrementButton:
                    this._offsetValue(SpinButtonValueOffset.STEP_INCREMENT);
                    break;
            }
        }
    }
}
