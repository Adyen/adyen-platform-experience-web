import './Icon.scss';
import cx from 'classnames';
import { JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const icons = {
    'angle-right': () => import('../../../../../src/images/icons/angle-right.svg?component'),
    'arrow-right': () => import('../../../../../src/images/icons/arrow-right.svg?component'),
    'checkmark-circle-fill': () => import('../../../../../src/images/icons/checkmark-circle-fill.svg?component'),
    'checkmark-square-fill': () => import('../../../../../src/images/icons/checkmark-square-fill.svg?component'),
    checkmark: () => import('../../../../../src/images/icons/checkmark.svg?component'),
    'checkbox-disabled': () => import('../../../../../src/images/icons/checkbox-disabled.svg?component'),
    'chevron-down': () => import('../../../../../src/images/icons/chevron-down.svg?component'),
    'chevron-left': () => import('../../../../../src/images/icons/chevron-left.svg?component'),
    'chevron-right': () => import('../../../../../src/images/icons/chevron-right.svg?component'),
    'chevron-up': () => import('../../../../../src/images/icons/chevron-up.svg?component'),
    'chevron-up-down': () => import('../../../../../src/images/icons/chevron-up-down.svg?component'),
    copy: () => import('../../../../../src/images/icons/copy.svg?component'),
    'cross-circle-fill': () => import('../../../../../src/images/icons/cross-circle-fill.svg?component'),
    search: () => import('../../../../../src/images/icons/search.svg?component'),
    cross: () => import('../../../../../src/images/icons/cross.svg?component'),
    download: () => import('../../../../../src/images/icons/download.svg?component'),
    'external-link': () => import('../../../../../src/images/icons/external-link.svg?component'),
    filter: () => import('../../../../../src/images/icons/filter.svg?component'),
    info: () => import('../../../../../src/images/icons/info.svg?component'),
    'info-filled': () => import('../../../../../src/images/icons/info-filled.svg?component'),
    'minus-circle-outline': () => import('../../../../../src/images/icons/minus-circle-outline.svg?component'),
    plus: () => import('../../../../../src/images/icons/plus.svg?component'),
    'plus-circle-outline': () => import('../../../../../src/images/icons/plus-circle-outline.svg?component'),
    square: () => import('../../../../../src/images/icons/square.svg?component'),
    'square-small-fill': () => import('../../../../../src/images/icons/square-small-fill.svg?component'),
    'trash-can': () => import('../../../../../src/images/icons/trash-can.svg?component'),
    cog: () => import('../../../../../src/images/icons/cog.svg?component'),
    upload: () => import('../../../../../src/images/icons/upload.svg?component'),
    'warning-filled': () => import('../../../../../src/images/icons/warning-filled.svg?component'),
    warning: () => import('../../../../../src/images/icons/warning.svg?component'),
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
