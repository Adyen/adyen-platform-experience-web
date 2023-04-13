import { ComponentChild, ComponentChildren, JSX } from 'preact';
import Language from '../../../../language';
import { HTMLAttributes } from 'preact/compat';

export interface FieldProps {
    className?: string;
    classNameModifiers?: string[];
    children?: ComponentChildren;
    disabled?: boolean;
    errorMessage?: string | boolean;
    filled?: boolean;
    focused?: boolean;
    helper?: string;
    inputWrapperModifiers?: string[];
    isLoading?: boolean;
    isValid?: boolean;
    label?: string | ComponentChild;
    labelEndAdornment?: string | JSX.Element;
    onBlur?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onFocus?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onFocusField?: () => void;
    onFieldBlur?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    dir?: HTMLAttributes<HTMLDivElement>['dir'];
    name?: string;
    showValidIcon?: boolean;
    isCollatingErrors?: boolean;
    useLabelElement?: boolean;
    i18n?: Language;
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
