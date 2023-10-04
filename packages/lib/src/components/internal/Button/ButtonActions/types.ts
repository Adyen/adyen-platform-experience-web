import { ButtonVariant } from '@src/components/internal/Button/types';

export interface ButtonActionObject {
    title: string;
    event: (event: Event) => void;
    icon?: Node;
    disabled?: boolean;
    variant?: ButtonVariant;
    critical?: boolean;
}

export type ButtonActionsList = Array<ButtonActionObject>;

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
