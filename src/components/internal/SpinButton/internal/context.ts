import {
    DEFAULT_VALUE_LEAP,
    DEFAULT_VALUE_MAX,
    DEFAULT_VALUE_MIN,
    DEFAULT_VALUE_NOW,
    DEFAULT_VALUE_STEP,
    EVENT_STATE_NOTIFICATION,
} from './constants';
import {
    ALREADY_RESOLVED_PROMISE,
    asPlainObject,
    boolOrFalse,
    clamp,
    EMPTY_OBJECT,
    enumerable,
    getter,
    isUndefined,
    struct,
} from '../../../../utils';
import { add, divide } from './utils';
import type { SpinButtonContext } from './types';

export const createSpinButtonContext = (stopNotificationSignal: AbortSignal) => {
    let leap = DEFAULT_VALUE_LEAP;
    let max = DEFAULT_VALUE_MAX;
    let min = DEFAULT_VALUE_MIN;
    let origin = DEFAULT_VALUE_NOW;
    let step = DEFAULT_VALUE_STEP;
    let value = DEFAULT_VALUE_NOW;

    let disabled = false;
    let notificationPending = false;

    const eventTarget = new EventTarget();

    /**
     * Given the optional `min` and/or `max` values as arguments respectively, this function will return an array
     * `[normalized_min, normalized_max]` so that `normalized_max` is always greater than or equal to `normalized_min`.
     *
     * If the specified `min` and/or `max` value is not a finite number, the corresponding default value
     * (`DEFAULT_VALUE_MIN` or `DEFAULT_VALUE_MAX` respectively) is used instead for any computation.
     *
     * The `min` value, when specified, is used as a pivot value — which means that the `normalized_max` value will
     * never be lower than the specified `min` value, even when the specified `max` value is.
     */
    const normalizeRange = (min?: number, max?: number): readonly [min: number, max: number] => {
        const hasMin = !isUndefined(min);
        const hasMax = !isUndefined(max);

        if (hasMin && hasMax) return [min, min > max ? Math.max(min, DEFAULT_VALUE_MAX) : max] as const;
        if (hasMin) return [min, Math.max(min, DEFAULT_VALUE_MAX)] as const;
        if (hasMax) return [Math.min(max, DEFAULT_VALUE_MIN), max] as const;

        return [DEFAULT_VALUE_MIN, DEFAULT_VALUE_MAX] as const;
    };

    const recalibrate: SpinButtonContext['recalibrate'] = (config = EMPTY_OBJECT) => {
        let { leap: _leap, max: _max, min: _min, step: _step } = asPlainObject(config);
        let sendNotification = false;

        // recalibrate range
        [_min, _max] = normalizeRange(_min, _max);

        if (min !== (min = _min)) sendNotification ||= true;
        if (max !== (max = _max)) sendNotification ||= true;
        if (sendNotification) recomputeOrigin();

        // recalibrate step
        _step = Math.max(0, _step ?? DEFAULT_VALUE_STEP) || DEFAULT_VALUE_STEP;
        _leap = isUndefined(_leap) ? DEFAULT_VALUE_LEAP : Math.max(0, Math.floor(_leap));

        if (step !== (step = _step)) sendNotification ||= true;
        if (leap !== (leap = _leap)) sendNotification ||= true;

        // recalibrate value
        if (updateValue(value)) sendNotification ||= true;

        if (sendNotification) sendChangeNotification();
    };

    /**
     * Recomputes the range origin value based on the current `min` and `max` values of the context.
     * This computation is done in two definite steps:
     *
     * 1. Calculate the mid_value of the range:
     *     > `min + (max - min) / 2`
     *
     * 2. Snap the mid_value to the nearest stepped value based on `step` using the `min` as pivot:
     *     > `min + Math.round((mid_value - min) / step) * step`
     */
    const recomputeOrigin = () => {
        const midValue = add(min, divide(add(max, -min), 2));
        origin = add(min, Math.round(divide(add(midValue, -min), step)) * step);
    };

    const updateValue = (nextValue: number | undefined) => {
        const currentValue = getValue();
        value = clamp(min, Number(nextValue), max);
        return currentValue !== getValue();
    };

    const sendChangeNotification = () => {
        if (!stopNotificationSignal.aborted && !notificationPending) {
            notificationPending = true;

            // schedule microtask to fulfill pending change notification delivery
            ALREADY_RESOLVED_PROMISE.then(() => {
                notificationPending = false;
                eventTarget.dispatchEvent(
                    new CustomEvent(EVENT_STATE_NOTIFICATION, {
                        bubbles: false,
                        cancelable: false,
                    })
                );
            });
        }
    };

    const getValue = () => value || origin || 0;

    const setValue = (value: number | undefined) => {
        if (updateValue(value)) sendChangeNotification();
    };

    const setDisabled = (value: boolean | undefined) => {
        if (disabled !== (disabled = boolOrFalse(value))) sendChangeNotification();
    };

    return struct<SpinButtonContext>({
        addEventListener: enumerable(eventTarget.addEventListener.bind(eventTarget)),
        removeEventListener: enumerable(eventTarget.removeEventListener.bind(eventTarget)),
        disabled: { ...getter(() => disabled), set: setDisabled },
        decrementDisabled: getter(() => disabled || getValue() === min),
        incrementDisabled: getter(() => disabled || getValue() === max),
        leap: getter(() => leap),
        max: getter(() => max),
        min: getter(() => min),
        step: getter(() => step),
        value: { ...getter(getValue), set: setValue },
        recalibrate: enumerable(recalibrate),
        signal: enumerable(stopNotificationSignal),
    });
};

export default createSpinButtonContext;
