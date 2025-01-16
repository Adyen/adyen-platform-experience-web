import { AnchorHTMLAttributes } from 'preact/compat';

export interface LinkProps {
    href: string;

    /**
     * Configure the active CSS class applied when the link is active. Note the default value can also be configured
     * globally via the `linkActiveClass` router constructor option.
     *
     * @default "router-link-active"
     */
    activeClass?: string;

    /**
     * Custom Props
     */

    /**
     * Sets the target of the rendered link.
     */
    target?: AnchorHTMLAttributes<any>['target'];

    /**
     * Set to true to truncate link.
     */
    truncate?: boolean;

    variant?: 'default' | 'quiet';
}
