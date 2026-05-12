import './Icon.scss';
import cx from 'classnames';
import { JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const icons = {
    'angle-right': () => import('./icons/angle-right.svg?component'),
    'arrow-right': () => import('./icons/arrow-right.svg?component'),
    'checkmark-circle-fill': () => import('./icons/checkmark-circle-fill.svg?component'),
    'checkmark-square-fill': () => import('./icons/checkmark-square-fill.svg?component'),
    checkmark: () => import('./icons/checkmark.svg?component'),
    'checkbox-disabled': () => import('./icons/checkbox-disabled.svg?component'),
    'chevron-down': () => import('./icons/chevron-down.svg?component'),
    'chevron-left': () => import('./icons/chevron-left.svg?component'),
    'chevron-right': () => import('./icons/chevron-right.svg?component'),
    'chevron-up': () => import('./icons/chevron-up.svg?component'),
    'chevron-up-down': () => import('./icons/chevron-up-down.svg?component'),
    copy: () => import('./icons/copy.svg?component'),
    'cross-circle-fill': () => import('./icons/cross-circle-fill.svg?component'),
    search: () => import('./icons/search.svg?component'),
    cross: () => import('./icons/cross.svg?component'),
    download: () => import('./icons/download.svg?component'),
    'external-link': () => import('./icons/external-link.svg?component'),
    filter: () => import('./icons/filter.svg?component'),
    info: () => import('./icons/info.svg?component'),
    'info-filled': () => import('./icons/info-filled.svg?component'),
    'minus-circle-outline': () => import('./icons/minus-circle-outline.svg?component'),
    plus: () => import('./icons/plus.svg?component'),
    'plus-circle-outline': () => import('./icons/plus-circle-outline.svg?component'),
    square: () => import('./icons/square.svg?component'),
    'square-small-fill': () => import('./icons/square-small-fill.svg?component'),
    'trash-can': () => import('./icons/trash-can.svg?component'),
    cog: () => import('./icons/cog.svg?component'),
    upload: () => import('./icons/upload.svg?component'),
    'warning-filled': () => import('./icons/warning-filled.svg?component'),
    warning: () => import('./icons/warning.svg?component'),
} as const;

export type IconName = keyof typeof icons;

/**
 * Props for the Icon component.
 */
interface IconProps {
    /**
     * The name of the icon to be displayed.
     */
    name: IconName;

    /**
     * Optional class name(s) for styling the icon.
     */
    className?: string;

    /**
     * Any additional attributes or properties that can be passed to the icon element (e.g., role, aria-label, etc.).
     */
    [key: string]: any;
}

export const Icon = ({ className, name, ...props }: IconProps) => {
    const [IconComponent, setIconComponent] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (icons[name]) {
            icons[name]().then(({ default: LoadedIcon }) => {
                setIconComponent(<LoadedIcon />);
            });
        } else {
            setIconComponent(null);
            console.error(`Icon with name "${name}" does not exist.`);
        }
    }, [name]);

    return (
        IconComponent && (
            <span className={cx('adyen-pe-icon', className)} role="img" aria-hidden {...props}>
                {IconComponent}
            </span>
        )
    );
};

export default Icon;
