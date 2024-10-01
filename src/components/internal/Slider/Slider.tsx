import { useEffect, useMemo, useState } from 'preact/hooks';
import './Slider.scss';
import { JSX } from 'preact';
import { calculateProgress } from './calculateProgress';

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
     * @default 0
     */
    value?: number;

    /**
     * Callback function that is called when the slider value changes.
     * @param value - The new value of the slider.
     */
    onValueChange?: (value: number) => void;
}

const Slider = ({ min = 0, max = 100, step = 1, value: initialValue = 0, onValueChange }: SliderProps) => {
    const [value, setValue] = useState<number>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const progress = useMemo(() => {
        return calculateProgress(value, min, max, step);
    }, [value, min, max, step]);

    const handleInputChange = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const newValue = Number((event.target as HTMLInputElement).value);
        setValue(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <input
            type="range"
            className="adyen-pe-slider"
            min={min}
            max={max}
            step={step}
            value={value}
            onInput={handleInputChange}
            style={{ backgroundSize: `${progress}% 100%` }}
        />
    );
};

export default Slider;
