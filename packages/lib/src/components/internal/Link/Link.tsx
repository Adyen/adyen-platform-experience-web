import classNames from 'classnames';
import { ComponentChild, ComponentChildren } from 'preact';
import './Link.scss';
import { useMemo } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';

export enum LinkVariant {
    DEFAULT = 'default',
    QUIET = 'quiet',
}
interface _LinkProps extends JSXInternal.HTMLAttributes<HTMLAnchorElement> {
    variant: LinkVariant;
}

export type LinkProps = Omit<_LinkProps, 'children'> & {
    children: NonNullable<ComponentChild> | NonNullable<ComponentChild>[];
};

const DEFAULT_LINK_CLASSNAME = 'adyen-fp-link';

//TO-DO: Add external and internal
export default function Link({ children, variant = LinkVariant.DEFAULT, ...props }: LinkProps) {
    const conditionalClasses = useMemo(() => (variant === LinkVariant.QUIET ? `${DEFAULT_LINK_CLASSNAME}--quiet` : ''), [variant]);
    return (
        <a {...props} className={`${DEFAULT_LINK_CLASSNAME} ${conditionalClasses}`}>
            {children}
        </a>
    );
}
