import type { HTMLAttributes } from 'preact';
import type { SpinButtonCalibrationConfigProps, SpinButtonRecord } from './internal/types';

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes
type ExcludedSpinButtonInputProps =
    | 'accept'
    | 'alt'
    | 'capture'
    | 'checked'
    | 'dirname'
    | 'formaction'
    | 'formAction'
    | 'formenctype'
    | 'formEncType'
    | 'formmethod'
    | 'formMethod'
    | 'formnovalidate'
    | 'formNoValidate'
    | 'formtarget'
    | 'formTarget'
    | 'height'
    | 'maxlength'
    | 'maxLength'
    | 'minlength'
    | 'minLength'
    | 'multiple'
    | 'pattern'
    | 'placeholder'
    | 'size'
    | 'src'
    | 'width';

export const enum SpinButtonControl {
    INCREMENT,
    DECREMENT,
}

export interface SpinButtonProps
    extends Omit<HTMLAttributes<HTMLInputElement>, ExcludedSpinButtonInputProps | keyof SpinButtonCalibrationConfigProps>,
        SpinButtonCalibrationConfigProps {
    disabled?: boolean;
    onStatePush?: NonNullable<SpinButtonRecord['onStatePush']>;
    value?: number;
    valueAsText?: (value: number) => string;
}
