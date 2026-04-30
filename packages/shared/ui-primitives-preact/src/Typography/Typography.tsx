import { DEFAULT_TYPOGRAPHY_CLASSNAME } from './constants';
import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { TypographyElement, TypographyModifier, TypographyVariant } from './types';
import { memo, PropsWithChildren } from 'preact/compat';
import './Typography.scss';
import { ComponentChild } from 'preact';

interface TypographyProps {
    id?: string;
    el?: TypographyElement;
    stronger?: boolean;
    strongest?: boolean;
    variant: TypographyVariant;
    medium?: boolean;
    large?: boolean;
    wide?: boolean;
    children: ComponentChild;
    className?: string;
    testId?: string;
}

function Typography({ el, id, className, stronger, strongest, variant, medium, large, testId, wide, children }: PropsWithChildren<TypographyProps>) {
    const Tag = el || 'p';
    const conditionalClasses = useMemo(
        () => ({
            // Caption
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.CAPTION}`]: variant === TypographyVariant.CAPTION,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.CAPTION}-${TypographyModifier.WIDE}`]:
                variant === TypographyVariant.CAPTION && wide,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.CAPTION}-${TypographyModifier.STRONGER}`]:
                variant === TypographyVariant.CAPTION && stronger,

            // Body
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.BODY}`]: variant === TypographyVariant.BODY,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.BODY}-${TypographyModifier.WIDE}`]: variant === TypographyVariant.BODY && wide,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.BODY}-${TypographyModifier.STRONGER}`]:
                variant === TypographyVariant.BODY && stronger,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.BODY}-${TypographyModifier.STRONGEST}`]:
                variant === TypographyVariant.BODY && strongest,

            // Subtitle
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.SUBTITLE}`]: variant === TypographyVariant.SUBTITLE,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.SUBTITLE}-${TypographyModifier.STRONGER}`]:
                variant === TypographyVariant.SUBTITLE && stronger,

            // Title
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.TITLE}`]: variant === TypographyVariant.TITLE && !medium && !large,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.TITLE}-${TypographyModifier.MEDIUM}`]:
                variant === TypographyVariant.TITLE && medium,
            [`${DEFAULT_TYPOGRAPHY_CLASSNAME}--${TypographyVariant.TITLE}-${TypographyModifier.LARGE}`]: variant === TypographyVariant.TITLE && large,
        }),
        [variant, wide, stronger, medium, large, strongest]
    );

    return (
        <Tag id={id} className={cx([`${DEFAULT_TYPOGRAPHY_CLASSNAME}`, conditionalClasses, className])} data-testid={testId}>
            {children}
        </Tag>
    );
}

export default memo(Typography);
