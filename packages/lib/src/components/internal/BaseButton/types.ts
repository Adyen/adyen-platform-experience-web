import { JSXInternal } from 'preact/src/jsx';

export interface ButtonProps extends JSXInternal.HTMLAttributes<HTMLButtonElement> {
    classNameModifiers?: string[];
}
