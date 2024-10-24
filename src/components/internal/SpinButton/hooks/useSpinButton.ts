import createSpinButton from '../internal/createSpinButton';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { SpinButtonCalibrationConfigProps } from '../internal/types';
import type { SpinButtonProps } from '../types';

type UseSpinButtonProps = SpinButtonCalibrationConfigProps & Pick<SpinButtonProps, 'disabled' | 'value' | 'onStatePush'>;

export const useSpinButton = <T extends UseSpinButtonProps>({ disabled, leap, max, min, step, value, onStatePush }: T) => {
    const [, setLastChangeTimestamp] = useState(performance.now());
    const abortController = useRef(new AbortController()).current;
    const spinButton = useRef(createSpinButton(abortController.signal)).current;

    const { keyboardInteraction, mouseInteraction, value: currentValue } = spinButton;

    const $refs = useMemo(
        () =>
            ({
                containerElement: (el: HTMLElement | null) => void (spinButton.containerElement = el),
                decrementButton: (el: HTMLButtonElement | null) => void (spinButton.decrementButton = el),
                incrementButton: (el: HTMLButtonElement | null) => void (spinButton.incrementButton = el),
                valueElement: (el: HTMLElement | null) => void (spinButton.valueElement = el),
            } as const),
        []
    );

    spinButton.onStatePush = useCallback<NonNullable<typeof onStatePush>>(
        currentState => {
            setLastChangeTimestamp(performance.now());
            onStatePush?.(currentState);
        },
        [onStatePush]
    );

    useLayoutEffect(() => {
        spinButton.disabled = disabled;
    }, [disabled]);

    useLayoutEffect(() => {
        spinButton.recalibrate({ leap, max, min, step });
    }, [leap, max, min, step]);

    useLayoutEffect(() => {
        spinButton.value = value;
    }, [value]);

    useEffect(() => {
        return () => abortController.abort();
    }, []);

    return { $refs, currentValue, keyboardInteraction, mouseInteraction } as const;
};

export default useSpinButton;
