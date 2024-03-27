import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { useCallback } from 'preact/hooks';
import useCoreContext from '@src/core/Context/useCoreContext';
import { TranslationKey } from '@src/core/Localization/types';
import './ErrorMessageDisplay.scss';
import { JSXInternal } from 'preact/src/jsx';
import noResults from '../../../images/no-results.svg';
import Button from '@src/components/internal/Button';
import useAuthContext from '@src/core/Auth/useAuthContext';
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
    const { i18n } = useCoreContext();
    const { updateCore } = useAuthContext();
    const renderMessage = useCallback(
        (errorMessage: TranslationKey | TranslationKey[]) => {
            if (Array.isArray(errorMessage)) {
                return errorMessage.map((message, i) =>
                    i === 0 ? (
                        <>
                            {i18n.get(message)}
                            {translationValues && translationValues[message] && <>{translationValues[message]}</>}
                        </>
                    ) : (
                        <>
                            <br />
                            {i18n.get(message)}
                            {translationValues && translationValues[message] && <>{translationValues[message]}</>}
                        </>
                    )
                );
            }
            return i18n.get(errorMessage);
        },
        [i18n, translationValues]
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

            {(onContactSupport || refreshComponent) && (
                <div className={'adyen-fp-error-message-display__button'}>
                    {onContactSupport && <Button onClick={onContactSupport}>{i18n.get('reachOutToSupport')}</Button>}
                    {!onContactSupport && refreshComponent && <Button onClick={() => updateCore?.()}>{i18n.get('refresh')}</Button>}
                </div>
            )}
        </div>
    );
};
