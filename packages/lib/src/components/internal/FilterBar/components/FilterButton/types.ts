import { ComponentChildren } from 'preact';

export interface FilterButtonProps {
    disabled?: boolean;
    onClick?: (...args: any) => void;
    tabIndex?: number;
    type?: string;
    children: ComponentChildren;
    ariaAttributes?: { [k: string]: any };
    classNameModifiers?: string[];
}
