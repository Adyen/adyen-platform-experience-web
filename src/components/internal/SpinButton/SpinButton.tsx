import h from 'preact';
import cx from 'classnames';
import BaseButton from '../BaseButton';
import _SpinButton from './internal/SpinButton';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { SpinButtonControl, SpinButtonControlRender, SpinButtonProps } from './types';
import { BASE_CLASS, BUTTON_CLASS, BUTTON_DECREASE_CLASS, BUTTON_INCREASE_CLASS, INPUT_CLASS } from './constants';

const defaultRenderControl: SpinButtonControlRender = control => {
    switch (control) {
        case SpinButtonControl.DECREMENT:
            return '-';
        case SpinButtonControl.INCREMENT:
            return '+';
        default:
            return null;
    }
};

const SpinButton = ({
    children,
    className,
    disabled,
    leap,
    max,
    min,
    onInput,
    onKeyDown,
    step,
    value,
    valueAsText,
    ...restProps
}: SpinButtonProps) => {
    // const minValue = useMemo(() => min ?? 0, [min]);
    // const maxValue = useMemo(() => Math.max(minValue, max ?? 100), [max, minValue]);
    // const stepValue = useMemo(() => (step && step > 0) ? step : 1, [step]);
    // const stepScaleValue = useMemo(() => Math.max(1, stepScale ?? 10), [stepScale]);
    const [currentValue, setCurrentValue] = useState(value ?? min ?? max ?? 0);
    const renderControl = useMemo(() => children ?? defaultRenderControl, [children]);
    const spinButton = useRef(new _SpinButton()).current;

    const containerElementRef = useCallback((el: HTMLElement | null) => void (spinButton.containerElement = el), []);
    const decreaseButtonRef = useCallback((el: HTMLButtonElement | null) => void (spinButton.decrementButton = el), []);
    const increaseButtonRef = useCallback((el: HTMLButtonElement | null) => void (spinButton.incrementButton = el), []);
    const spinButtonElementRef = useCallback((el: HTMLElement | null) => void (spinButton.spinButtonElement = el), []);

    const _onInput = (evt: h.JSX.TargetedInputEvent<HTMLInputElement>) => {
        try {
            onInput?.(evt);
        } finally {
            const inputElement = evt.currentTarget;
            if (!inputElement.value) inputElement.value = `${currentValue}`;
        }
    };

    const _onKeyDown = (evt: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        spinButton.onKeyboardInteraction(evt);
        onKeyDown?.(evt);
    };

    spinButton.disabled = disabled;
    spinButton.onChange = setCurrentValue;

    return (
        <div ref={containerElementRef} className={cx(BASE_CLASS, className)}>
            <BaseButton
                type="button"
                ref={decreaseButtonRef}
                className={cx(BUTTON_CLASS, BUTTON_DECREASE_CLASS)}
                onClick={spinButton.onMouseInteraction}
            >
                {renderControl(SpinButtonControl.DECREMENT)}
            </BaseButton>

            <input
                {...restProps}
                type="text"
                inputmode="decimal"
                value={currentValue}
                ref={spinButtonElementRef}
                className={cx('adyen-pe-input', INPUT_CLASS)}
                onKeyDown={_onKeyDown}
                onInput={_onInput}
                {...(!!valueAsText && { 'aria-valuetext': valueAsText(currentValue) ?? currentValue })}
            />

            <BaseButton
                type="button"
                ref={increaseButtonRef}
                className={cx(BUTTON_CLASS, BUTTON_INCREASE_CLASS)}
                onClick={spinButton.onMouseInteraction}
            >
                {renderControl(SpinButtonControl.INCREMENT)}
            </BaseButton>
        </div>
    );
};

export default SpinButton;
