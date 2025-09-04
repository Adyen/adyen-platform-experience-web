import Typography from '../Typography/Typography';
import { TypographyVariant } from '../Typography/types';
import { useCallback } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../translations';
import './ErrorMessageDisplay.scss';
import { JSXInternal } from 'preact/src/jsx';
import Button from '../Button';
import cx from 'classnames';

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
    absolutePosition?: boolean;
    outlined?: boolean;
    renderSecondaryButton?: () => JSXInternal.Element;
    withBackground?: boolean;
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
    absolutePosition = true,
    outlined = true,
    renderSecondaryButton,
    withBackground,
}: ErrorMessageDisplayProps) => {
    const { i18n, updateCore, getImageAsset } = useCoreContext();
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
        <div
            className={cx(['adyen-pe-error-message-display'], {
                'adyen-pe-error-message-display--absolute-position': absolutePosition,
                'adyen-pe-error-message-display--outlined': outlined,
                'adyen-pe-error-message-display--with-background': withBackground !== false && !outlined,
                'adyen-pe-error-message-display--centered': centered,
            })}
        >
            {(imageDesktop || imageMobile || withImage) && (
                <div className="adyen-pe-error-message-display__illustration">
                    <picture>
                        <source type="image/svg+xml" media={`(min-width: ${IMAGE_BREAKPOINT_SIZES.md}px)`} srcSet={imageDesktop} />
                        <source type="image/svg+xml" media={`(max-width: ${IMAGE_BREAKPOINT_SIZES.md}px)`} srcSet={imageMobile} />
                        <img srcSet={imageDesktop ?? getImageAsset?.({ name: 'no-results' })} alt={i18n.get('thereWasAnUnexpectedError')} />
                    </picture>
                </div>
            )}
            <Typography variant={TypographyVariant.TITLE}>{i18n.get(title)}</Typography>
            {message && <Typography variant={TypographyVariant.BODY}>{renderMessage(message)}</Typography>}

            {(onContactSupport || refreshComponent || renderSecondaryButton) && (
                <div className={'adyen-pe-error-message-display__button'}>
                    {renderSecondaryButton && renderSecondaryButton()}
                    {onContactSupport && <Button onClick={onContactSupport}>{i18n.get('reachOutToSupport')}</Button>}
                    {!onContactSupport && refreshComponent && <Button onClick={updateCore}>{i18n.get('refresh')}</Button>}
                </div>
            )}
        </div>
    );
};
