import cx from 'classnames';
import _SpinButton from './internal/SpinButton';
import { SpinButtonControl, SpinButtonProps } from './types';
import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { defaultRenderControl, defaultRenderValue } from './helpers';
import { EMPTY_OBJECT, isFunction } from '../../../utils';
import { BASE_CLASS } from './constants';

const SpinButton = ({ asText, className, disabled, leap, max, min, renderControl, renderValue, steps, value, ...restProps }: SpinButtonProps) => {
    // const minValue = useMemo(() => min ?? 0, [min]);
    // const maxValue = useMemo(() => Math.max(minValue, max ?? 100), [max, minValue]);
    // const stepValue = useMemo(() => (step && step > 0) ? step : 1, [step]);
    // const stepScaleValue = useMemo(() => Math.max(1, stepScale ?? 10), [stepScale]);
    const [currentValue, setCurrentValue] = useState(0);
    const _renderControl = useMemo(() => (isFunction(renderControl) ? renderControl : defaultRenderControl), [renderControl]);
    const _renderValue = useMemo(() => (isFunction(renderValue) ? renderValue : defaultRenderValue), [renderValue]);

    const decrementControlRef = useCallback((el: HTMLElement | null) => void (spinButton.decrementElem = el), []);
    const incrementControlRef = useCallback((el: HTMLElement | null) => void (spinButton.incrementElem = el), []);
    const spinButtonElementRef = useCallback((el: HTMLElement | null) => void (spinButton.spinButtonElem = el), []);
    const spinButton = useRef(new _SpinButton()).current;

    spinButton.disabled = disabled;
    spinButton.onChange = setCurrentValue;

    return (
        <div
            {...restProps}
            ref={spinButtonElementRef}
            className={cx(BASE_CLASS, className)}
            onClick={spinButton.handleMouseInteraction}
            onClickCapture={spinButton.startInteraction}
            onKeyDown={spinButton.handleKeyboardInteraction}
            onKeyDownCapture={spinButton.startInteraction}
            {...(isFunction(asText) ? { 'aria-valuetext': asText(currentValue) ?? currentValue } : EMPTY_OBJECT)}
        >
            {_renderControl(SpinButtonControl.DECREMENT, decrementControlRef)}
            {_renderValue(currentValue)}
            {_renderControl(SpinButtonControl.INCREMENT, incrementControlRef)}
        </div>
    );
};

export default SpinButton;
