import { useMemo } from 'preact/hooks';
import './Slider.scss';
import { JSX } from 'preact';
import { calculateProgress } from './calculateProgress';
import cx from 'classnames';

export function calculateSliderAdjustedMidValue(minValue: number, maxValue: number, step: number) {
    const mid = maxValue / 2;
    let adjustedMid = Math.round(mid / step) * step;

    if (adjustedMid < minValue) {
        adjustedMid = minValue;
    } else if (adjustedMid > maxValue) {
        adjustedMid = maxValue;
    }

    return adjustedMid;
}

/**
 * Props for the Slider component.
 */
interface SliderProps {
    /**
     * Minimum value of the slider.
     * @default 0
     */
    min?: number;

    /**
     * Maximum value of the slider.
     * @default 100
     */
    max?: number;

    /**
     * Step value for the slider.
     * Defines the increment/decrement amount when the slider is moved.
     * @default 1
     */
    step?: number;

    /**
     * The current value of the slider.
     * @default min
     */
    value?: number;

    /**
     * Callback function that is called when the slider value changes.
     * @param value - The new value of the slider.
     */
    onChange?: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => void;

    /**
     * Optional class name(s) for styling the Slider.
     */
    className?: string;

    /**
     * Any additional attributes or properties that can be passed to the Slider element
     */
    [key: string]: any;
}

const Slider = ({ min = 0, max = 100, step = 1, value = min, onChange, className, ...restOfProps }: SliderProps) => {
    const progress = useMemo(() => {
        return calculateProgress(value, min, max, step);
    }, [value, min, max, step]);

    return (
        <input
            type="range"
            className={cx('adyen-pe-slider', className)}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            style={{ backgroundSize: `${progress}% 100%` }}
            {...restOfProps}
        />
    );
};

export default Slider;
