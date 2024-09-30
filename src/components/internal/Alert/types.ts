import { ComponentChild, VNode } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface AlertProps {
    className?: string;
    type: AlertTypeOption;
    title?: VNode<Element> | string;
    description?: VNode<Element> | string;
    children?: ComponentChild;
    onClose?: (event: JSXInternal.TargetedMouseEvent<HTMLButtonElement>) => void;
}

export enum AlertTypeOption {
    WARNING = 'warning',
    CRITICAL = 'critical',
    HIGHLIGHT = 'highlight',
    SUCCESS = 'success',
}
