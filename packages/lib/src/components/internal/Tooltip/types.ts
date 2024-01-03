import { VNode } from 'preact';
import { Reflex } from '@src/hooks/useReflex';

export interface TooltipProps {
    content: string;
    children?: VNode<any>;
    triggerRef?: Reflex<HTMLElement>;
    showTooltip?: boolean;
}
