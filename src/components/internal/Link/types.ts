import { AnchorHTMLAttributes } from 'preact/compat';

export interface LinkProps {
    href: string;

    activeClass?: string;

    target?: AnchorHTMLAttributes<any>['target'];

    truncate?: boolean;

    variant?: 'default' | 'quiet';

    classNameModifiers?: string;
}
