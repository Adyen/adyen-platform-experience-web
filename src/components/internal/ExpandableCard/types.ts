import { ComponentChild, ComponentChildren } from 'preact';
import { AriaAttributes } from 'preact/compat';

export type ExpandableCardContentRender = (ctx: { isExpanded: boolean; collapsibleContent?: ComponentChildren }) => ComponentChild;

export interface ExpandableCardProps extends Pick<AriaAttributes, 'aria-description' | 'aria-describedby' | 'aria-label' | 'aria-labelledby'> {
    renderContent: ExpandableCardContentRender | ComponentChild;
    filled?: boolean;
    fullWidth?: boolean;
    inFlow?: boolean;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onMouseLeave?: () => void;
    onBlur?: () => void;
}
