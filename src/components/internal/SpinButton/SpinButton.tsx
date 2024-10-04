import { useCallback, useRef, useState } from 'preact/hooks';
import { clamp } from '../../../utils';
import { TagVariant } from '../Tag/types';
import { Tag } from '../Tag/Tag';
import { SpinButtonOffsetDirection } from './types';
import { InteractionKeyCode } from '../../types';

const SpinButton = ({ disabled }: { disabled?: boolean }) => {
    // Core elements (refs)
    const decrementControl = useRef<HTMLButtonElement>(null);
    const incrementControl = useRef<HTMLButtonElement>(null);
    const spinButtonContainer = useRef<HTMLDivElement>(null);

    // Declare state
    const [value, setValue] = useState(0);

    // Value manipulation functions
    const getValueOffsetMagnitude = useCallback((isLargeOffset = false) => (isLargeOffset ? 10 : 1), []);
    const setValueToMaximum = useCallback(() => setValue(100), []);
    const setValueToMinimum = useCallback(() => setValue(0), []);

    const offsetValue = useCallback(
        (offsetDirection: 0 | 1 = SpinButtonOffsetDirection.INCREASING, isLargeOffset = false) => {
            const valueOffset = getValueOffsetMagnitude(isLargeOffset) * Math.pow(-1, offsetDirection);
            setValue(value => clamp(0, value + valueOffset, 100));
        },
        [getValueOffsetMagnitude]
    );

    // User interaction handlers
    const onInteractionEventCapture = useCallback(
        (evt: MouseEvent | KeyboardEvent) => {
            if (!disabled) return;
            evt.preventDefault();
            evt.stopPropagation();
        },
        [disabled]
    );

    const onKeyDownEvent = useCallback((evt: KeyboardEvent) => {
        switch (evt.code) {
            // Step decrement
            case InteractionKeyCode.ARROW_DOWN:
            case InteractionKeyCode.ARROW_LEFT:
                offsetValue(SpinButtonOffsetDirection.DECREASING, false);
                break;

            // Step increment
            case InteractionKeyCode.ARROW_UP:
            case InteractionKeyCode.ARROW_RIGHT:
                offsetValue(SpinButtonOffsetDirection.INCREASING, false);
                break;

            // Large decrement
            case InteractionKeyCode.PAGE_DOWN:
                offsetValue(SpinButtonOffsetDirection.DECREASING, true);
                break;

            // Large increment
            case InteractionKeyCode.PAGE_UP:
                offsetValue(SpinButtonOffsetDirection.INCREASING, true);
                break;

            // Minimum value
            case InteractionKeyCode.HOME:
                setValueToMinimum();
                break;

            // Maximum value
            case InteractionKeyCode.END:
                setValueToMaximum();
                break;

            // Ignore other keys
            default:
                return;
        }

        // Prevent any default action for handled keys
        evt.preventDefault();
    }, []);

    // Render component
    return (
        <div
            role="spinbutton"
            ref={spinButtonContainer}
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            onClickCapture={onInteractionEventCapture}
            onKeyDownCapture={onInteractionEventCapture}
            onKeyDown={onKeyDownEvent}
        >
            {/* Decrement control */}
            <button
                type="button"
                tabIndex={-1}
                ref={decrementControl}
                disabled={disabled || value === 0}
                onClick={() => offsetValue(SpinButtonOffsetDirection.DECREASING, false)}
            ></button>

            <Tag variant={TagVariant.DEFAULT} label={`${value}`} />

            {/* Increment control */}
            <button
                type="button"
                tabIndex={-1}
                ref={incrementControl}
                disabled={disabled || value === 100}
                onClick={() => offsetValue(SpinButtonOffsetDirection.INCREASING, false)}
            ></button>
        </div>
    );
};

export default SpinButton;
