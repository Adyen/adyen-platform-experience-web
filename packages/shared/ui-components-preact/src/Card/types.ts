import { ComponentChild } from 'preact';

export interface CardProps {
    onClickHandler?: () => void;
    title?: string;
    subTitle?: string;
    footer?: string;
    renderHeader?: ComponentChild;
    renderFooter?: ComponentChild;
    filled?: boolean;
    noOutline?: boolean;
    noPadding?: boolean;
    buttonAriaLabel?: string;
    classNameModifiers?: string[];
    testId?: string;
    expandable?: boolean;
    compact?: boolean;
}
