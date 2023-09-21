import { Component, ComponentChildren, JSX } from 'preact';
import Localization from '../../../../localization';
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
    label?: string | Component | (() => string | Component);
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
    i18n?: Localization['i18n'];
}

export interface FieldState {
    disabled?: boolean;
    filled?: boolean;
    focused?: boolean;
}
