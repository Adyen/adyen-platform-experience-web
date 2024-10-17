import type { SpinButtonCalibrationProps } from './internal/types';
import type { HTMLProps } from 'preact/compat';
import type { ComponentChild } from 'preact';

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

export type SpinButtonControlRender = (control: SpinButtonControl) => ComponentChild;

export interface SpinButtonProps
    extends Omit<HTMLProps<HTMLInputElement>, ExcludedSpinButtonInputProps | keyof SpinButtonCalibrationProps>,
        SpinButtonCalibrationProps {
    children?: SpinButtonControlRender;
    disabled?: boolean;
    valueAsText?: (value: number) => string;
}
