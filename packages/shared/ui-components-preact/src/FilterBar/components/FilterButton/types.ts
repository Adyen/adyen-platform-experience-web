import { ComponentChild } from 'preact';
import { ButtonHTMLAttributes } from 'preact/compat';

export interface _FilterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    classNameModifiers?: string[];
}

export type FilterButtonProps = Omit<_FilterButtonProps, 'children'> & {
    children: NonNullable<ComponentChild> | NonNullable<ComponentChild>[];
};
