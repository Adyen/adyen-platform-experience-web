import './Icon.scss';
import cx from 'classnames';
import { JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { icons, type IconName } from 'virtual:tree-shaken-icons';

export type { IconName };

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
            icons[name]().then(({ default: LoadedIcon }: { default: any }) => {
                setIconComponent(<LoadedIcon />);
            });
        } else {
            setIconComponent(null);
            console.error(`Icon with name "${String(name)}" does not exist.`);
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
