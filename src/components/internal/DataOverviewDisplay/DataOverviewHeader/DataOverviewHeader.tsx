import { FC } from 'preact/compat';
import Typography from '../../Typography/Typography';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../Typography/types';
import type { TranslationKey } from '../../../../translations';
import type { UIElementProps } from '../../../types';
import './DataOverviewHeader.scss';

export const BASE_CLASS = 'adyen-pe-data-overview-header';

export interface DataOverviewHeaderProps {
    baseClassName?: string;
    descriptionKey?: TranslationKey;
    hideTitle?: UIElementProps['hideTitle'];
    titleKey?: TranslationKey;
}

export const DataOverviewHeader: FC<DataOverviewHeaderProps> = ({ baseClassName = BASE_CLASS, children, hideTitle, titleKey, descriptionKey }) => {
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
                {descriptionKey && (
                    <p className={`${baseClassName}__description`}>
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                            {i18n.get(descriptionKey)}
                        </Typography>
                    </p>
                )}
            </div>
            {children && <div className={`${baseClassName}__controls`}>{children}</div>}
        </div>
    );
};
