import { VNode } from 'preact';

export interface TooltipProps {
    content: string;
    children?: VNode<any>;
    targetRef?: HTMLElement;
    test: any;
}
