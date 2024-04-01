import { PopoverContainerPosition } from '@src/components/internal/Popover/types';
import { VNode } from 'preact';
import { Reflex } from '@src/hooks/useReflex';

export type TooltipPosition = 'top' | 'bottom' | 'right' | 'left';

export interface TooltipProps {
    content: string | VNode<any>;
    children?: VNode<any>;
    triggerRef?: Reflex<HTMLElement>;
    showTooltip?: boolean;
    position?: PopoverContainerPosition;
    isContainerHovered: boolean;
}
