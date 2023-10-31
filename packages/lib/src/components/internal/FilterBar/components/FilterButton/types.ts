import { ComponentChildren } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface FilterButtonProps {
    disabled?: boolean;
    onClick?: (...args: any) => void;
    tabIndex?: number;
    type?: string;
    children: ComponentChildren;
    ariaAttributes?: JSXInternal.AriaAttributes;
    classNameModifiers?: string[];
}
