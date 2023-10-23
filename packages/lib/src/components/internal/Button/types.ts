import { ComponentChildren } from 'preact';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link';

export interface ButtonProps extends Record<string, any> {
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    disabled?: boolean;
    iconLeft?: HTMLElement;
    iconRight?: HTMLElement;
    inline?: boolean;
    tabIndex?: number;
    type?: 'submit' | 'reset' | 'button';
    ariaAttributes: { [k: string]: any };
    key?: string;
    onClick: (e?: Event, callbacks?: { [k: string]: (...args: any) => void }) => void;
    children: ComponentChildren;
    ariaLabel?: string;
}

export interface ButtonState {
    completed?: boolean;
}

export enum ButtonVariants {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
}
