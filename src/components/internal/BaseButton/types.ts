import { ButtonHTMLAttributes } from 'preact/compat';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    classNameModifiers?: string[];
    fullWidth?: boolean;
}
