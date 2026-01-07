import AdyenPlatformExperienceError from '../../../../../../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../../../../translations';
import { ErrorMessageDisplay } from '../../../../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import getSettingsErrorMessage from '../../utils/getSettingsErrorMessage';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

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
    const { getImageAsset } = useCoreContext();

    const { title, message, refreshComponent, translationValues, images } = getSettingsErrorMessage(
        error,
        errorMessage,
        onContactSupport,
        getImageAsset
    );

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
            onContactSupport={onContactSupport}
            outlined={false}
        />
    );
};
export default SettingsError;
