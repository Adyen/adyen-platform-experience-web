import './Icon.scss';
import cx from 'classnames';
import { JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const icons = {
    check: () => import('../../../images/icons/check.svg?component'),
    'field-error': () => import('../../../images/icons/field-error.svg?component'),
    warning: () => import('../../../images/icons/warning.svg?component'),
    'info-circle': () => import('../../../images/icons/info-circle.svg?component'),
} as const;

export type IconName = keyof typeof icons;

interface IconProps {
    name: IconName;
    className?: string;
}

export const Icon = ({ className, name }: IconProps) => {
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
        <span className={cx('adyen-pe-icon', className)} role="img" aria-hidden>
            {IconComponent}
        </span>
    );
};

export default Icon;
