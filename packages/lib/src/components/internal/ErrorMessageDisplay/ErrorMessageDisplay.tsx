import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { useCallback } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { TranslationKey } from '@src/core/Localization/types';
import './ErrorMessageDisplay.scss';
import noResults from '../../../images/no-results.svg';
import Button from '@src/components/internal/Button';
export const IMAGE_BREAKPOINT_SIZES = {
    md: 680,
    lg: 1024,
};
export const ErrorMessageDisplay = ({
    title,
    message,
    imageDesktop,
    imageMobile,
    withImage,
    centered,
    refreshComponent,
}: {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    imageDesktop?: string;
    imageMobile?: string;
    withImage?: boolean;
    centered?: boolean;
    refreshComponent?: boolean;
}) => {
    const { i18n } = useCoreContext();

    const renderMessage = useCallback(
        (errorMessage: TranslationKey | TranslationKey[]) => {
            if (Array.isArray(errorMessage)) {
                return errorMessage.map((message, i) =>
                    i === 0 ? (
                        i18n.get(message)
                    ) : (
                        <>
                            <br />
                            {i18n.get(message)}
                        </>
                    )
                );
            }
            return i18n.get(errorMessage);
        },
        [i18n]
    );

    return (
        <div className={`adyen-fp-error-message-display ${centered ? 'adyen-fp-error-message-display--centered' : ''}`}>
            {(imageDesktop || imageMobile || withImage) && (
                <div className="adyen-fp-error-message-display__illustration">
                    <picture>
                        <source type="image/svg+xml" media={`(min-width: ${IMAGE_BREAKPOINT_SIZES.md}px)`} srcSet={imageDesktop} />
                        <source type="image/svg+xml" media={`(max-width: ${IMAGE_BREAKPOINT_SIZES.md}px)`} srcSet={imageMobile} />
                        <img srcSet={imageDesktop ?? noResults} alt={i18n.get('thereWasAnUnexpectedError')} />
                    </picture>
                </div>
            )}
            <Typography variant={TypographyVariant.TITLE}>{i18n.get(title)}</Typography>
            {message && <Typography variant={TypographyVariant.BODY}>{renderMessage(message)}</Typography>}
            {refreshComponent && (
                <div className={'adyen-fp-error-message-display__button'}>
                    <Button>{i18n.get('refreshThePage')}</Button>
                </div>
            )}
        </div>
    );
};
