import { VNode } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface ButtonProps extends JSXInternal.HTMLAttributes<HTMLButtonElement> {
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    iconLeft?: VNode<Element>;
    iconRight?: VNode<Element>;
    inline?: boolean;
    iconButton?: boolean;
    fullWidth?: boolean;
    condensed?: boolean;
    state?: 'loading' | 'default';
}

export enum ButtonVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    TERTIARY_WITH_BACKGROUND = 'tertiary-with-background',
    LINK = 'link',
}
