export interface SpinButtonCalibrationProps {
    leap?: number;
    max?: number;
    min?: number;
    step?: number;
    value?: number;
}

export interface SpinButtonState extends Required<SpinButtonCalibrationProps> {
    disabled: boolean;
    decrementButtonDisabled: boolean;
    incrementButtonDisabled: boolean;
}

export const enum SpinButtonValueOffset {
    STEP_INCREMENT,
    STEP_DECREMENT,
    LEAP_INCREMENT,
    LEAP_DECREMENT,
}
