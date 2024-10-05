import { ComponentChild } from 'preact';
import { HTMLProps } from 'preact/compat';

type _AllowedExternalStandardProps = Pick<
    HTMLProps<any>,
    | 'aria-controls'
    | 'aria-hidden'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-description'
    | 'aria-required'
    | 'className'
    | 'hidden'
    | 'id'
>;

export const enum SpinButtonControl {
    INCREMENT,
    DECREMENT,
}

export interface SpinButtonProps extends _AllowedExternalStandardProps {
    asText?: (value: number) => string;
    disabled?: boolean;
    leap?: number;
    max?: number;
    min?: number;
    renderControl?: (control: SpinButtonControl, ref: (el: HTMLElement | null) => unknown) => ComponentChild;
    renderValue?: (value: number) => ComponentChild;
    steps?: number;
    value?: number;
}
