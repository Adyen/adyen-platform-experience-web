import h from 'preact';
import cx from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import createSpinButton from './internal/SpinButton';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BASE_CLASS, BUTTON_CLASS, BUTTON_DECREASE_CLASS, BUTTON_INCREASE_CLASS, INPUT_CLASS, INPUT_SIZER_ELEMENT_CLASS } from './constants';
import { SpinButtonControl, SpinButtonControlRender, SpinButtonProps } from './types';
import { EMPTY_OBJECT } from '../../../utils';
import { ButtonVariant } from '../Button/types';
import { SpinButtonState } from './internal/types';
import './SpinButton.scss';

const defaultRenderControl: SpinButtonControlRender = control => {
    switch (control) {
        case SpinButtonControl.DECREMENT:
            return <Icon name="minus-circle-outline" />;
        case SpinButtonControl.INCREMENT:
            return <Icon name="plus-circle-outline" />;
        default:
            return null;
    }
};

const SpinButton = ({ children, className, disabled, leap, max, min, onKeyDown, step, value, valueAsText, ...restProps }: SpinButtonProps) => {
    const [currentState, setCurrentState] = useState(EMPTY_OBJECT as SpinButtonState);
    const renderControl = useMemo(() => children ?? defaultRenderControl, [children]);
    const abortController = useRef(new AbortController()).current;
    const spinButton = useRef(createSpinButton(abortController.signal)).current;

    const containerElementRef = useCallback((el: HTMLElement | null) => void (spinButton.containerElement = el), []);
    const decreaseButtonRef = useCallback((el: HTMLButtonElement | null) => void (spinButton.decrementButton = el), []);
    const increaseButtonRef = useCallback((el: HTMLButtonElement | null) => void (spinButton.incrementButton = el), []);
    const valueElementRef = useCallback((el: HTMLElement | null) => void (spinButton.valueElement = el), []);

    const { value: currentValue } = currentState;

    const _onKeyDown = (evt: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        spinButton.keyboardInteraction(evt);
        onKeyDown?.(evt);
    };

    spinButton.disabled = disabled!;
    spinButton.onStateChanged = setCurrentState;

    useLayoutEffect(() => {
        spinButton.recalibrate({ leap, max, min, step });
        spinButton.value = value!;
    }, [leap, max, min, step, value]);

    return (
        <div ref={containerElementRef} className={cx(BASE_CLASS, className)}>
            <Button
                iconButton
                ref={decreaseButtonRef}
                variant={ButtonVariant.TERTIARY}
                className={cx(BUTTON_CLASS, BUTTON_DECREASE_CLASS)}
                onClick={spinButton.mouseInteraction}
            >
                {renderControl(SpinButtonControl.DECREMENT)}
            </Button>

            <div className="adyen-pe-width-sizer">
                <input
                    {...restProps}
                    readOnly
                    type="text"
                    inputMode="decimal"
                    value={currentValue}
                    ref={valueElementRef}
                    className={cx('adyen-pe-input', INPUT_CLASS)}
                    onKeyDown={_onKeyDown}
                    {...(!!valueAsText && { 'aria-valuetext': valueAsText(currentValue) ?? currentValue })}
                />

                <div className={cx('adyen-pe-width-sizer__element', INPUT_SIZER_ELEMENT_CLASS)} aria-hidden={true}>
                    {currentValue}
                </div>
            </div>

            <Button
                iconButton
                ref={increaseButtonRef}
                variant={ButtonVariant.TERTIARY}
                className={cx(BUTTON_CLASS, BUTTON_INCREASE_CLASS)}
                onClick={spinButton.mouseInteraction}
            >
                {renderControl(SpinButtonControl.INCREMENT)}
            </Button>
        </div>
    );
};

export default SpinButton;
