import { ComponentChild } from 'preact';
import { HTMLProps } from 'preact/compat';

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes
type _BlacklistedSpinButtonInputProps =
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

export interface SpinButtonProps extends Omit<HTMLProps<HTMLInputElement>, _BlacklistedSpinButtonInputProps> {
    children?: SpinButtonControlRender;
    disabled?: boolean;
    leap?: number;
    max?: number;
    min?: number;
    step?: number;
    value?: number;
    valueAsText?: (value: number) => string;
}
