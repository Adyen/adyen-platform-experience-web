import cx from 'classnames';
import { FC } from 'preact/compat';
import Typography from '../Typography/Typography';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import type { TranslationKey } from '../../../translations';
import type { UIElementProps } from '../../types';
import './Header.scss';
import { Divider } from '../Divider/Divider';

export const BASE_CLASS = 'adyen-pe-header';

export interface HeaderProps {
    baseClassName?: string;
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

export const Header: FC<HeaderProps> = ({ baseClassName = BASE_CLASS, children, hasDivider, hideTitle, titleKey, subtitleKey, subtitleConfig }) => {
    const { i18n } = useCoreContext();
    return (
        <div className={baseClassName}>
            <div className={`${baseClassName}__headings`}>
                {!hideTitle && titleKey && (
                    <div className={`${baseClassName}__title`}>
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.TITLE} medium>
                            {i18n.get(titleKey)}
                        </Typography>
                    </div>
                )}
                {subtitleKey && (
                    <div className={cx(`${baseClassName}__subtitle`, subtitleConfig?.classNames)}>
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
