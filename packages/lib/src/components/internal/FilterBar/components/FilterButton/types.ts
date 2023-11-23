import { ComponentChild } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export interface _FilterButtonProps extends JSXInternal.HTMLAttributes<HTMLButtonElement> {
    classNameModifiers?: string[];
}

export type FilterButtonProps = Omit<_FilterButtonProps, 'children'> & {
    children: NonNullable<ComponentChild> | NonNullable<ComponentChild>[];
};
