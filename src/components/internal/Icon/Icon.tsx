import './Icon.scss';
import cx from 'classnames';
import { JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const icons = {
    'angle-right': () => import('../../../images/icons/angle-right.svg?component'),
    'checkmark-circle-fill': () => import('../../../images/icons/checkmark-circle-fill.svg?component'),
    'checkmark-square-fill': () => import('../../../images/icons/checkmark-square-fill.svg?component'),
    checkmark: () => import('../../../images/icons/checkmark.svg?component'),
    'chevron-down': () => import('../../../images/icons/chevron-down.svg?component'),
    'chevron-left': () => import('../../../images/icons/chevron-left.svg?component'),
    'chevron-right': () => import('../../../images/icons/chevron-right.svg?component'),
    'chevron-up': () => import('../../../images/icons/chevron-up.svg?component'),
    'chevron-up-down': () => import('../../../images/icons/chevron-up-down.svg?component'),
    copy: () => import('../../../images/icons/copy.svg?component'),
    'cross-circle-fill': () => import('../../../images/icons/cross-circle-fill.svg?component'),
    search: () => import('../../../images/icons/search.svg?component'),
    cross: () => import('../../../images/icons/cross.svg?component'),
    download: () => import('../../../images/icons/download.svg?component'),
    'external-link': () => import('../../../images/icons/external-link.svg?component'),
    filter: () => import('../../../images/icons/filter.svg?component'),
    'info-filled': () => import('../../../images/icons/info-filled.svg?component'),
    'minus-circle-outline': () => import('../../../images/icons/minus-circle-outline.svg?component'),
    plus: () => import('../../../images/icons/plus.svg?component'),
    'plus-circle-outline': () => import('../../../images/icons/plus-circle-outline.svg?component'),
    square: () => import('../../../images/icons/square.svg?component'),
    'square-small-fill': () => import('../../../images/icons/square-small-fill.svg?component'),
    'trash-can': () => import('../../../images/icons/trash-can.svg?component'),
    upload: () => import('../../../images/icons/upload.svg?component'),
    'warning-filled': () => import('../../../images/icons/warning-filled.svg?component'),
    warning: () => import('../../../images/icons/warning.svg?component'),
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
