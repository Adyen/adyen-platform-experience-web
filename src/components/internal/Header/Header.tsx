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
}

export const Header: FC<HeaderProps> = ({ baseClassName = BASE_CLASS, children, hasDivider, hideTitle, titleKey, subtitleKey }) => {
    const { i18n } = useCoreContext();
    return (
        <header className={baseClassName}>
            <div className={`${baseClassName}__headings`}>
                {!hideTitle && titleKey && (
                    <div className={`${baseClassName}__title`}>
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.TITLE} medium>
                            {i18n.get(titleKey)}
                        </Typography>
                    </div>
                )}
                {subtitleKey && (
                    <p className={`${baseClassName}__subtitle`}>
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                            {i18n.get(subtitleKey)}
                        </Typography>
                    </p>
                )}
                {hasDivider && <Divider className={`${baseClassName}__divider`} />}
            </div>
            {children && <div className={`${baseClassName}__controls`}>{children}</div>}
        </header>
    );
};
