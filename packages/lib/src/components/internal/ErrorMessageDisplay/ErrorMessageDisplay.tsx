import Typography from '../Typography/Typography';
import { TypographyVariant } from '../Typography/types';
import { useCallback } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../core/Localization/types';
import './ErrorMessageDisplay.scss';
import { JSXInternal } from 'preact/src/jsx';
import noResults from '../../../images/no-results.svg';
import Button from '../Button';
import { useTranslation } from 'react-i18next';

export const IMAGE_BREAKPOINT_SIZES = {
    md: 680,
    lg: 1024,
};

type ErrorMessageDisplayProps = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    imageDesktop?: string;
    imageMobile?: string;
    withImage?: boolean;
    centered?: boolean;
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    translationValues?: { [k in TranslationKey]?: JSXInternal.Element | null };
};

export const ErrorMessageDisplay = ({
    title,
    message,
    imageDesktop,
    imageMobile,
    withImage,
    centered,
    refreshComponent,
    onContactSupport,
    translationValues,
}: ErrorMessageDisplayProps) => {
    const { updateCore } = useCoreContext();
    const { t } = useTranslation();

    const renderMessage = useCallback(
        (errorMessage: TranslationKey | TranslationKey[]) => {
            if (Array.isArray(errorMessage)) {
                return errorMessage.map((message, i) =>
                    i === 0 ? (
                        <>
                            {t(message)}
                            {translationValues && translationValues[message] && <>{translationValues[message]}</>}
                        </>
                    ) : (
                        <>
                            <br />
                            {t(message)}
                            {translationValues && translationValues[message] && <>{translationValues[message]}</>}
                        </>
                    )
                );
            }
            return t(errorMessage);
        },
        [t, translationValues]
    );

    return (
        <div className={`adyen-pe-error-message-display ${centered ? 'adyen-pe-error-message-display--centered' : ''}`}>
            {(imageDesktop || imageMobile || withImage) && (
                <div className="adyen-pe-error-message-display__illustration">
                    <picture>
                        <source type="image/svg+xml" media={`(min-width: ${IMAGE_BREAKPOINT_SIZES.md}px)`} srcSet={imageDesktop} />
                        <source type="image/svg+xml" media={`(max-width: ${IMAGE_BREAKPOINT_SIZES.md}px)`} srcSet={imageMobile} />
                        <img srcSet={imageDesktop ?? noResults} alt={t('thereWasAnUnexpectedError')} />
                    </picture>
                </div>
            )}
            <Typography variant={TypographyVariant.TITLE}>{t(title)}</Typography>
            {message && <Typography variant={TypographyVariant.BODY}>{renderMessage(message)}</Typography>}

            {(onContactSupport || refreshComponent) && (
                <div className={'adyen-pe-error-message-display__button'}>
                    {onContactSupport && <Button onClick={onContactSupport}>{t('reachOutToSupport')}</Button>}
                    {!onContactSupport && refreshComponent && <Button onClick={updateCore}>{t('refresh')}</Button>}
                </div>
            )}
        </div>
    );
};
