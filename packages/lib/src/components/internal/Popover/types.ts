import { ButtonActionsLayout, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
import { ComponentChildren } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { MutableRef } from 'preact/hooks';

export enum PopoverContainerVariant {
    TOOLTIP = 'tooltip',
    POPOVER = 'popover',
}

interface PopoverCoreProps {
    actions?: ButtonActionsList;
    actionsLayout?: ButtonActionsLayout;
    ariaLabel: string;
    variant?: PopoverContainerVariant;
    divider?: boolean;
    dismissible?: boolean;
    fitContent?: boolean;
    disableFocusTrap?: boolean;
    open?: boolean;
    withContentPadding?: boolean;
    modifiers?: string[];
    position?: PopoverContainerPosition;
    containerSize?: PopoverContainerSize;
    title?: string;
    targetElement: MutableRef<Element | null>;
    withoutSpace?: boolean;
    dismiss?: () => any;
    children: ComponentChildren;
}

type UncontrolledProps = Pick<HTMLAttributes<any>, 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'role'>;

export type PopoverProps = PopoverCoreProps & UncontrolledProps;

export enum PopoverContainerPosition {
    TOP = 'top',
    RIGHT = 'right',
    BOTTOM = 'bottom',
    LEFT = 'left',
}

export enum PopoverContainerSize {
    SMALL = 'small',
    LARGE = 'large',
}
