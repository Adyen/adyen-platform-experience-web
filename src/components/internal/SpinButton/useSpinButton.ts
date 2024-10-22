import createSpinButton from './internal/SpinButton';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { SpinButtonCalibrationConfigProps } from './internal/types';
import type { SpinButtonProps } from './types';

type UseSpinButtonProps = SpinButtonCalibrationConfigProps & Pick<SpinButtonProps, 'disabled' | 'value' | 'onStateChange'>;

export const useSpinButton = <T extends UseSpinButtonProps>({ disabled, leap, max, min, step, value, onStateChange }: T) => {
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

    spinButton.onStateChange = useCallback(() => {
        setLastChangeTimestamp(performance.now());
        const { disabled, decrementDisabled, incrementDisabled, leap, max, min, step, value } = spinButton;
        onStateChange?.({ disabled, decrementDisabled, incrementDisabled, leap, max, min, step, value } as const);
    }, [onStateChange]);

    useLayoutEffect(() => {
        spinButton.disabled = disabled;
    }, [disabled]);

    useLayoutEffect(() => {
        spinButton.recalibrate({ leap, max, min, step });
    }, [leap, max, min, step]);

    useLayoutEffect(() => {
        spinButton.value = value;
    }, [value]);

    return { $refs, currentValue, keyboardInteraction, mouseInteraction } as const;
};

export default useSpinButton;
