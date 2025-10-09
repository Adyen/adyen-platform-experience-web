import { VNode } from 'preact';
import { PopoverContainerPosition } from '../Popover/types';

export type TooltipPosition = 'top' | 'bottom' | 'right' | 'left';

export interface TooltipProps {
    content: string | VNode<any>;
    children?: VNode<any>;
    showTooltip?: boolean;
    position?: PopoverContainerPosition;
    isContainerHovered?: boolean;
}
