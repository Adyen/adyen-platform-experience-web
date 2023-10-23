import classNames from 'classnames';
import { ComponentChildren } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import './Link.scss';

export enum LinkVariant {
    DEFAULT = 'default',
    QUIET = 'quiet',
}
interface LinkProps extends HTMLAttributes<HTMLAnchorElement> {
    children: ComponentChildren;
    variant?: LinkVariant;
    linkClasses?: string;
    onClick?: () => any;
}

//TO-DO: Add external and internal
export default function Link({ linkClasses, children, variant = LinkVariant.DEFAULT, onClick, ...props }: LinkProps) {
    const conditionalClasses = () => [...(linkClasses ? [linkClasses] : []), variant === LinkVariant.QUIET ? ['adyen-fp-link--quiet'] : []];
    return (
        <a {...props} className={classNames('adyen-fp-link', conditionalClasses())} onClick={onClick}>
            {children}
        </a>
    );
}
