import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import { LinkProps } from './types';
import { PropsWithChildren, TargetedEvent } from 'preact/compat';
import cx from 'classnames';
import { useCallback } from 'preact/hooks';
import './Link.scss';
import Icon from '../Icon';

function Link({ href, children, variant = 'default', truncate, target = '_blank', withIcon = true, ...props }: PropsWithChildren<LinkProps>) {
    const onClick = useCallback((e: TargetedEvent<HTMLAnchorElement>) => e.stopPropagation(), []);
    return (
        <a
            className={cx('adyen-pe-link', {
                [`adyen-pe-link--${variant}`]: variant !== 'default',
                'adyen-pe-link--truncate': truncate,
            })}
            href={href}
            target={target}
            rel="noopener noreferrer"
            onClick={onClick}
            {...props}
        >
            <Typography className="adyen-pe-link__text" el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                {children}
            </Typography>
            {withIcon && target === '_blank' && <Icon name="external-link" />}
        </a>
    );
}

export default Link;
