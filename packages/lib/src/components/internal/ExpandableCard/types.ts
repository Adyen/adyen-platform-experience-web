import { ComponentChild } from 'preact';

export interface ExpandableCardProps {
    renderHeader: ComponentChild;
    filled?: boolean;
    onMouseOver?: () => void;
    onFocus?: () => void;
    onMouseOut?: () => void;
    onBlur?: () => void;
}
