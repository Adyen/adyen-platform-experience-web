import AdyenPlatformExperienceError from '../../../../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../../../../translations';
import { ErrorMessageDisplay } from '../../../../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import getSettingsErrorMessage from '../../utils/getSettingsErrorMessage';

const SettingsError = ({
    error,
    errorMessage,
    onContactSupport,
    centered,
    absolutePosition,
}: {
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: TranslationKey;
    centered?: boolean;
    absolutePosition?: boolean;
    onContactSupport?: () => void;
}) => {
    const {
        title,
        message,
        refreshComponent,
        translationValues,
        onContactSupport: contactSupport,
        images,
    } = getSettingsErrorMessage(error, errorMessage, onContactSupport);

    return (
        <ErrorMessageDisplay
            imageDesktop={images?.desktop}
            imageMobile={images?.mobile}
            withHeaderOffset
            title={title}
            message={message}
            translationValues={translationValues}
            withImage
            centered={centered ?? false}
            absolutePosition={absolutePosition ?? false}
            refreshComponent={refreshComponent}
            onContactSupport={contactSupport}
        />
    );
};
export default SettingsError;
