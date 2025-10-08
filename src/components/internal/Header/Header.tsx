import cx from 'classnames';
import { FC, HTMLProps } from 'preact/compat';
import Typography from '../Typography/Typography';
import useCoreContext from '../../../core/Context/useCoreContext';
import useComponentHeadingElement, { ComponentHeadingType } from '../../../hooks/useComponentHeadingElement';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import type { TranslationKey } from '../../../translations';
import type { UIElementProps } from '../../types';
import { Divider } from '../Divider/Divider';
import './Header.scss';

export const BASE_CLASS = 'adyen-pe-header';

export interface HeaderProps extends HTMLProps<HTMLHeadingElement> {
    baseClassName?: string;
    forwardedToRoot?: boolean;
    hasDivider?: boolean;
    hideTitle?: UIElementProps['hideTitle'];
    subtitleKey?: TranslationKey;
    titleKey?: TranslationKey;
    subtitleConfig?: {
        variant?: TypographyVariant;
        typographyEl?: TypographyElement;
        classNames?: string;
    };
}

export const Header: FC<HeaderProps> = ({
    baseClassName = BASE_CLASS,
    forwardedToRoot = true,
    children,
    className,
    hasDivider,
    hideTitle,
    titleKey,
    subtitleKey,
    subtitleConfig,
    ...props
}) => {
    const { i18n } = useCoreContext();

    const { id: titleElemId, ref: titleElemRef } = useComponentHeadingElement<HTMLDivElement>({
        headingType: ComponentHeadingType.TITLE,
        forwardedToRoot,
    });

    const { id: subtitleElemId, ref: subtitleElemRef } = useComponentHeadingElement<HTMLDivElement>({
        headingType: ComponentHeadingType.SUBTITLE,
        forwardedToRoot,
    });

    return (
        <div {...props} className={cx([baseClassName, className])}>
            <div className={`${baseClassName}__headings`}>
                {!hideTitle && titleKey && (
                    <div ref={titleElemRef} id={titleElemId} className={`${baseClassName}__title`}>
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.TITLE} medium>
                            {i18n.get(titleKey)}
                        </Typography>
                    </div>
                )}
                {subtitleKey && (
                    <div ref={subtitleElemRef} id={subtitleElemId} className={cx(`${baseClassName}__subtitle`, subtitleConfig?.classNames)}>
                        <Typography
                            el={subtitleConfig?.typographyEl ?? TypographyElement.SPAN}
                            variant={subtitleConfig?.variant ?? TypographyVariant.BODY}
                        >
                            {i18n.get(subtitleKey)}
                        </Typography>
                    </div>
                )}
                {hasDivider && <Divider className={`${baseClassName}__divider`} />}
            </div>
            {children && <div className={`${baseClassName}__controls`}>{children}</div>}
        </div>
    );
};
