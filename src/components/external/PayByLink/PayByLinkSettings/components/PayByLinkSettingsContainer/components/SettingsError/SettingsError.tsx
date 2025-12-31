import AdyenPlatformExperienceError from '../../../../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../../../../translations';
import { ErrorMessageDisplay } from '../../../../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { AssetOptions } from '../../../../../../../../core/Assets/Assets';
import getSettingsErrorMessage from '../../utils/getSettingsErrorMessage';

const SettingsError = ({
    error,
    errorMessage,
    onContactSupport,
    getImageAsset,
    centered,
    absolutePosition,
}: {
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: TranslationKey;
    centered?: boolean;
    absolutePosition?: boolean;
    onContactSupport?: () => void;
    getImageAsset?: (props: AssetOptions) => string;
}) => {
    const {
        title,
        message,
        refreshComponent,
        translationValues,
        onContactSupport: ContactSupport,
        images,
    } = getSettingsErrorMessage(error, errorMessage, onContactSupport, getImageAsset);

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
            onContactSupport={ContactSupport}
        />
    );
};
export default SettingsError;
