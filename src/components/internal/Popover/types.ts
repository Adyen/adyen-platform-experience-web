import { ButtonActionsLayout, ButtonActionsList } from '../Button/ButtonActions/types';
import { ComponentChildren } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { MutableRef } from 'preact/hooks';

export enum PopoverContainerVariant {
    TOOLTIP = 'tooltip',
    POPOVER = 'popover',
}

export interface PopoverCoreProps {
    actions?: ButtonActionsList;
    actionsLayout?: ButtonActionsLayout;
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
    setToTargetWidth?: boolean;
    children: ComponentChildren;
    classNameModifiers?: string[];
    showOverlay?: boolean;
    fitPosition?: boolean;
    fixedPositioning?: boolean;
    additionalStyle?: { minY?: number; maxY?: number };
}

type UncontrolledProps = Pick<HTMLAttributes<any>, 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'role'>;

export type PopoverProps = PopoverCoreProps & UncontrolledProps;

export enum PopoverContainerPosition {
    TOP = 'top',
    RIGHT = 'right',
    BOTTOM = 'bottom',
    LEFT = 'left',
    TOP_RIGHT = 'top-right',
    TOP_LEFT = 'top-left',
    BOTTOM_RIGHT = 'bottom-right',
    BOTTOM_LEFT = 'bottom-left',
}

export enum PopoverContainerSize {
    MEDIUM = 'medium',
    WIDE = 'wide',
}
