import { ButtonVariant } from '../types';
import { ComponentChild, VNode } from 'preact';

export interface ButtonActionObject {
    title: string;
    event: (event: Event) => void;
    disabled?: boolean;
    variant?: ButtonVariant;
    renderTitle?: (title: string) => ComponentChild;
    state?: 'loading' | 'default';
    classNames?: string[];
    iconLeft?: VNode<Element>;
    iconRight?: VNode<Element>;
    ariaLabel?: string;
}

export type ButtonActionsList = ButtonActionObject[] | readonly ButtonActionObject[];

export enum ButtonActionsLayoutBasic {
    BUTTONS_END = 'buttons-end',
    FILL_CONTAINER = 'fill-container',
    SPACE_BETWEEN = 'space-between',
    VERTICAL_STACK = 'vertical-stack',
}

export enum ButtonActionsLayoutExtended {
    BUTTONS_START = 'buttons-start',
}

export const ButtonActionsLayout = { ...ButtonActionsLayoutBasic, ...ButtonActionsLayoutExtended };
export type ButtonActionsLayout = ButtonActionsLayoutBasic | ButtonActionsLayoutExtended;
