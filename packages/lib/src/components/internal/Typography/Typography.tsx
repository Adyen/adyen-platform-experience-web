import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { TypographyElement, TypographyModifier, TypographyVariant } from './types';
import { memo, PropsWithChildren } from 'preact/compat';
import './Typography.scss';
import { ComponentChild } from 'preact';

interface TypographyProps {
    el?: TypographyElement;
    stronger?: boolean;
    strongest?: boolean;
    variant: TypographyVariant;
    medium?: boolean;
    large?: boolean;
    wide?: boolean;
    children: ComponentChild;
    className?: string;
}

function Typography({ el, className, stronger, strongest, variant, medium, large, wide, children }: PropsWithChildren<TypographyProps>) {
    const Tag = el || 'p';
    const conditionalClasses = useMemo(
        () => ({
            // Caption
            [`adyen-fp-typography--${TypographyVariant.CAPTION}`]: variant === TypographyVariant.CAPTION,
            [`adyen-fp-typography--${TypographyVariant.CAPTION}-${TypographyModifier.WIDE}`]: variant === TypographyVariant.CAPTION && wide,
            [`adyen-fp-typography--${TypographyVariant.CAPTION}-${TypographyModifier.STRONGER}`]: variant === TypographyVariant.CAPTION && stronger,

            // Body
            [`adyen-fp-typography--${TypographyVariant.BODY}`]: variant === TypographyVariant.BODY,
            [`adyen-fp-typography--${TypographyVariant.BODY}-${TypographyModifier.WIDE}`]: variant === TypographyVariant.BODY && wide,
            [`adyen-fp-typography--${TypographyVariant.BODY}-${TypographyModifier.STRONGER}`]: variant === TypographyVariant.BODY && stronger,
            [`adyen-fp-typography--${TypographyVariant.BODY}-${TypographyModifier.STRONGEST}`]: variant === TypographyVariant.BODY && strongest,

            // Subtitle
            [`adyen-fp-typography--${TypographyVariant.SUBTITLE}`]: variant === TypographyVariant.SUBTITLE,
            [`adyen-fp-typography--${TypographyVariant.SUBTITLE}-${TypographyModifier.STRONGER}`]: variant === TypographyVariant.SUBTITLE && stronger,

            // Title
            [`adyen-fp-typography--${TypographyVariant.TITLE}`]: variant === TypographyVariant.TITLE && !medium && !large,
            [`adyen-fp-typography--${TypographyVariant.TITLE}-${TypographyModifier.MEDIUM}`]: variant === TypographyVariant.TITLE && medium,
            [`adyen-fp-typography--${TypographyVariant.TITLE}-${TypographyModifier.LARGE}`]: variant === TypographyVariant.TITLE && large,
        }),
        [variant, wide, stronger, medium, large, strongest]
    );

    return <Tag className={cx([`adyen-fp-typography ${className}`, conditionalClasses])}>{children}</Tag>;
}

export default memo(Typography);
