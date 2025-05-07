import { ComponentChild } from 'preact';

export interface ExpandableCardProps {
    renderHeader: ComponentChild;
    filled?: boolean;
    fullWidth?: boolean;
    inFlow?: boolean;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onMouseLeave?: () => void;
    onBlur?: () => void;
}
