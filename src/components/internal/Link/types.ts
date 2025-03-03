import { AnchorHTMLAttributes } from 'preact/compat';

export interface LinkProps {
    href: string;

    activeClass?: string;

    target?: AnchorHTMLAttributes<any>['target'];

    truncate?: boolean;

    /**
     * The visual variant of the link. Defaults to `default`.
     * Quiet variant has no underline.
     */
    variant?: 'default' | 'quiet';

    classNames?: string[];

    withIcon?: boolean;
}
