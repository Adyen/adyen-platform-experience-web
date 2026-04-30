import type { VNode, h } from 'preact';
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'preact/compat';
import { ButtonVariant } from '@integration-components/types';

export { ButtonVariant };

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
    align?: 'center' | 'left' | 'right';
};

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement>, BaseButtonProps {}

export interface RegularButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseButtonProps {}

export type ButtonProps = AnchorButtonProps | RegularButtonProps;
