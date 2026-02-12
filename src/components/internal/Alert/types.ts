import { ComponentChild, VNode, TargetedMouseEvent } from 'preact';

export interface AlertAction {
    label: string;
    onClick: () => void;
}

export interface AlertProps {
    actions?: AlertAction[];
    className?: string;
    closeButton?: boolean;
    type: AlertTypeOption;
    title?: VNode<Element> | string;
    description?: VNode<Element> | string;
    children?: ComponentChild;
    onClose?: (event: TargetedMouseEvent<HTMLButtonElement>) => void;
    variant?: AlertVariantOption;
}

export enum AlertTypeOption {
    WARNING = 'warning',
    CRITICAL = 'critical',
    HIGHLIGHT = 'highlight',
    SUCCESS = 'success',
}

export enum AlertVariantOption {
    DEFAULT = 'default',
    TIP = 'tip',
}
