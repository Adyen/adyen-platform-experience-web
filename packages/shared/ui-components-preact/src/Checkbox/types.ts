import { VNode } from 'preact';

export interface CheckboxProps {
    checked?: boolean;
    classNameModifiers?: string[];
    description?: string;
    disabled?: boolean;
    id?: string;
    label?: string | VNode;
    name?: string;
    onInput?: (event: any) => void;
    value?: boolean;
    className?: string;
    error?: boolean;
}
