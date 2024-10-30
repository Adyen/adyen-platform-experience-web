import { VNode } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface ButtonProps extends JSXInternal.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
    classNameModifiers?: string[];
    condensed?: boolean;
    variant?: ButtonVariant;
    iconLeft?: VNode<Element>;
    iconRight?: VNode<Element>;
    inline?: boolean;
    iconButton?: boolean;
    fullWidth?: boolean;
}

export enum ButtonVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    TERTIARY_WITH_BACKGROUND = 'tertiary-with-background',
    LINK = 'link',
}
