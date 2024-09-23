import { ComponentChild } from 'preact';

export interface ExpandableCardProps {
    renderHeader: ComponentChild;
    filled?: boolean;
    fullWidth?: boolean;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onMouseLeave?: () => void;
    onBlur?: () => void;
}
