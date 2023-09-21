import { HTMLAttributes } from 'preact/compat';

export interface FilterModalProps {
    toggleModal(): void;
    isOpen: boolean;
    label: string;
    classNameModifiers: string[];
    fieldName: string;
    value: HTMLAttributes<any>['value'];
}
