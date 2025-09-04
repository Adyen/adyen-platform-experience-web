import { ComponentChild } from 'preact';
import { AriaAttributes } from 'preact/compat';

export interface ExpandableCardProps extends Pick<AriaAttributes, 'aria-label'> {
    renderHeader: ComponentChild;
    filled?: boolean;
    fullWidth?: boolean;
    inFlow?: boolean;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onMouseLeave?: () => void;
    onBlur?: () => void;
}
