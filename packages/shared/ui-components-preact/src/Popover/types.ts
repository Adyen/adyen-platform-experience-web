import {
    PopoverContainerPosition,
    PopoverContainerSize,
    PopoverContainerVariant,
    type ButtonActionsLayout,
    type ButtonActionsList,
} from '@integration-components/types';
import { ComponentChildren } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { MutableRef } from 'preact/hooks';

export { PopoverContainerPosition, PopoverContainerSize, PopoverContainerVariant };

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
    setPopoverElement?: (element: HTMLDivElement | null) => void;
    additionalStyle?: { minY?: number; maxY?: number };
}

type UncontrolledProps = Pick<HTMLAttributes<any>, 'aria-describedby'>;

export type PopoverProps = PopoverCoreProps & UncontrolledProps;
