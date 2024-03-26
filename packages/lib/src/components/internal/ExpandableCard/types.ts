import { ComponentChild } from 'preact';

export interface ExpandableCardProps {
    renderHeader: ComponentChild;
    filled?: boolean;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onMouseLeave?: () => void;
    onBlur?: () => void;
}
