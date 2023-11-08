import { ComponentChild } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

interface _ButtonProps extends JSXInternal.HTMLAttributes<HTMLButtonElement> {
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    iconLeft?: HTMLElement;
    iconRight?: HTMLElement;
    inline?: boolean;
}

export type ButtonProps = Omit<_ButtonProps, 'children'> & {
    children: NonNullable<ComponentChild> | NonNullable<ComponentChild>[];
};

export enum ButtonVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    LINK = 'link',
}
