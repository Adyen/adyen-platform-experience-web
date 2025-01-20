import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import { LinkProps } from './types';
import { PropsWithChildren, TargetedEvent } from 'preact/compat';
import cx from 'classnames';
import { useCallback } from 'preact/hooks';
import './Link.scss';

function Link({ href, children, variant = 'default', truncate, target = '_blank', ...props }: PropsWithChildren<LinkProps>) {
    const onClick = useCallback((e: TargetedEvent<HTMLAnchorElement>) => e.stopPropagation(), []);
    return (
        <a
            className={cx('adyen-pe-link', {
                [`adyen-pe-link--${variant}`]: variant !== 'default',
                'adyen-pe-link--truncate': truncate,
            })}
            href={href}
            target={target}
            onClick={onClick}
            {...props}
        >
            <Typography className="adyen-pe-link__text" el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                {children}
            </Typography>
        </a>
    );
}

export default Link;
