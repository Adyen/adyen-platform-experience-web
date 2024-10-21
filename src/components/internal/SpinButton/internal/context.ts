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
    sameValue,
    struct,
} from '../../../../utils';
import { add, divide } from './utils';
import type { SpinButtonContext } from './types';

export const createSpinButtonContext = (stopNotificationSignal: AbortSignal) => {
    let leap = DEFAULT_VALUE_LEAP;
    let max = DEFAULT_VALUE_MAX;
    let min = DEFAULT_VALUE_MIN;
    let step = DEFAULT_VALUE_STEP;
    let value = DEFAULT_VALUE_NOW;

    let disabled = false;
    let notificationPending = false;

    const eventTarget = new EventTarget();
    const { addEventListener, removeEventListener } = Object.getOwnPropertyDescriptors(eventTarget);

    const normalizeRange = (min?: number, max?: number): readonly [number, number] => {
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

        // recalibrate step
        _step = Math.max(0, _step ?? DEFAULT_VALUE_STEP) || DEFAULT_VALUE_STEP;
        _leap = isUndefined(_leap) ? DEFAULT_VALUE_LEAP : Math.max(0, Math.floor(_leap));

        if (step !== (step = _step)) sendNotification ||= true;
        if (leap !== (leap = _leap)) sendNotification ||= true;

        // recalibrate value
        if (updateValue(value)) sendNotification ||= true;

        if (sendNotification) sendChangeNotification();
    };

    const updateValue = (nextValue: number | undefined) => {
        const rangeMidValue = add(min, divide(add(max, -min), 2));
        const fallbackValue = add(min, Math.round(divide(add(rangeMidValue, -min), step)) * step);
        const clampedValue = clamp(min, nextValue ?? fallbackValue, max);
        return !sameValue(value, (value = clampedValue));
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

    const getValue = () => value || 0;

    const setValue = (value: number | undefined) => {
        if (updateValue(value)) sendChangeNotification();
    };

    const setDisabled = (value: boolean | undefined) => {
        if (disabled !== (disabled = boolOrFalse(value))) sendChangeNotification();
    };

    return struct<SpinButtonContext>({
        addEventListener,
        removeEventListener,
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
