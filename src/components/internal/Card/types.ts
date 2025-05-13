import { ComponentChild } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface CardProps {
    onClickHandler?: () => void;
    title?: string;
    subTitle?: string;
    footer?: string;
    el?: 'header' | 'div';
    renderHeader?: ComponentChild;
    renderFooter?: ComponentChild;
    filled?: boolean;
    noOutline?: boolean;
    noPadding?: boolean;
    buttonAriaLabel?: string;
    classNameModifiers?: string[];
    testId?: string;
    expandable?: boolean;
}

export type AriaRole = JSXInternal.HTMLAttributes<HTMLDivElement>['role'];
