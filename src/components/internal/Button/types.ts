import type { VNode, h } from 'preact';
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'preact/compat';

export type BaseButtonProps = {
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    iconLeft?: VNode<Element>;
    iconRight?: VNode<Element>;
    inline?: boolean;
    iconButton?: boolean;
    fullWidth?: boolean;
    condensed?: boolean;
    state?: 'loading' | 'default';
    disabled?: h.JSX.Signalish<boolean | undefined>;
};

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement>, BaseButtonProps {}

export interface RegularButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseButtonProps {}

export type ButtonProps = AnchorButtonProps | RegularButtonProps;

export enum ButtonVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    TERTIARY_WITH_BACKGROUND = 'tertiary-with-background',
    LINK = 'link',
}
