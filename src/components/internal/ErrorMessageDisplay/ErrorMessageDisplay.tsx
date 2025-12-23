import cx from 'classnames';
import Button from '../Button';
import Typography from '../Typography/Typography';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import { TranslationKey } from '../../../translations';
import { JSXInternal } from 'preact/src/jsx';
import { useCallback } from 'preact/hooks';
import './ErrorMessageDisplay.scss';

const BASE_CLASS = 'adyen-pe-error-message-display';
export const IMAGE_BREAKPOINT_MEDIUM_PX = 680;

const classes = {
    base: BASE_CLASS,
    base_absolutePosition: BASE_CLASS + '--absolute-position',
    base_centered: BASE_CLASS + '--centered',
    base_outlined: BASE_CLASS + '--outlined',
    base_withBackground: BASE_CLASS + '--with-background',
    button: BASE_CLASS + '__button',
    illustration: BASE_CLASS + '__illustration',
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

const ErrorMessageSeparator = () => (
    <>
        {' ' /* collapsed whitespace */}
        <br />
        {' ' /* collapsed whitespace */}
    </>
);

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
        (errorMessage: TranslationKey | TranslationKey[]) =>
            Array.isArray(errorMessage)
                ? errorMessage.map((message, i) => (
                      <>
                          {i > 0 && <ErrorMessageSeparator />}
                          {i18n.get(message)}
                          {translationValues?.[message]}
                      </>
                  ))
                : i18n.get(errorMessage),
        [i18n, translationValues]
    );

    return (
        <div
            className={cx(classes.base, {
                [classes.base_absolutePosition]: absolutePosition,
                [classes.base_centered]: centered,
                [classes.base_outlined]: outlined,
                [classes.base_withBackground]: withBackground !== false && !outlined,
            })}
        >
            {(imageDesktop || imageMobile || withImage) && (
                <div className={classes.illustration}>
                    <picture>
                        <source type="image/svg+xml" media={`(min-width: ${IMAGE_BREAKPOINT_MEDIUM_PX}px)`} srcSet={imageDesktop} />
                        <source type="image/svg+xml" media={`(max-width: ${IMAGE_BREAKPOINT_MEDIUM_PX}px)`} srcSet={imageMobile} />
                        <img srcSet={imageDesktop ?? getImageAsset?.({ name: 'no-results' })} alt="" />
                    </picture>
                </div>
            )}

            <Typography el={TypographyElement.DIV} variant={TypographyVariant.TITLE}>
                {i18n.get(title)}
            </Typography>

            {message && <Typography variant={TypographyVariant.BODY}>{renderMessage(message)}</Typography>}

            {(onContactSupport || refreshComponent || renderSecondaryButton) && (
                <div className={classes.button}>
                    {renderSecondaryButton && renderSecondaryButton()}
                    {onContactSupport && <Button onClick={onContactSupport}>{i18n.get('common.actions.contactSupport.labels.reachOut')}</Button>}
                    {!onContactSupport && refreshComponent && (
                        <Button onClick={updateCore}>{i18n.get('common.actions.refresh.labels.default')}</Button>
                    )}
                </div>
            )}
        </div>
    );
};
