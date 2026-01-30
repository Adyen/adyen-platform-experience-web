import { ComponentChildren, JSX, TargetedEvent, TargetedKeyboardEvent } from 'preact';
import { SelectItem } from './Select/types';

export type InputFieldElementPosition = 'start' | 'end';

export interface InputFieldDropdownProps<T extends SelectItem = SelectItem> {
    'aria-label'?: string;
    disabled?: boolean;
    filterable?: boolean;
    items: readonly T[];
    name?: string;
    onBlur?: () => void;
    onInput?: (value: any) => void;
    readonly?: boolean;
    value?: T['id'] | readonly T['id'][];
    placeholder?: string;
}

export interface InputBaseProps {
    autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
    autoComplete?: 'off' | 'on';
    classNameModifiers?: string[];
    isInvalid?: boolean;
    isValid?: boolean;
    readonly?: boolean;
    type?: string;
    uniqueId?: string;
    isCollatingErrors?: boolean;
    disabled?: boolean;
    onClick?: (e: TargetedEvent<HTMLInputElement>) => void;
    onInput?: (e: TargetedEvent<HTMLInputElement, Event>, field?: string) => void;
    onKeyDown?: (e: TargetedKeyboardEvent<HTMLInputElement>) => void;
    onKeyUp?: (e: TargetedKeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: TargetedEvent<HTMLInputElement>) => void;
    onFocusHandler?: (e: TargetedEvent<HTMLInputElement>) => void;
    onBlurHandler?: (e: TargetedEvent<HTMLInputElement>) => void;
    trimOnBlur?: boolean;
    className?: string;
    name?: string;
    placeholder?: string;
    value?: any;
    maxLength?: number;
    minLength?: number;
    required?: boolean;
    role?: JSX.HTMLAttributes<HTMLInputElement>['role'];
    min?: number;
    errorMessage?: string;
    lang?: HTMLInputElement['lang'];
    iconBeforeSlot?: ComponentChildren;
    iconAfterSlot?: ComponentChildren;
    dropdown?: InputFieldDropdownProps;
    dropdownPosition?: InputFieldElementPosition;
    onDropdownInput?: (selectedValue: any) => void;
    onUpdateDropdown?: (updatedDropdownProps: InputFieldDropdownProps) => void;
}
