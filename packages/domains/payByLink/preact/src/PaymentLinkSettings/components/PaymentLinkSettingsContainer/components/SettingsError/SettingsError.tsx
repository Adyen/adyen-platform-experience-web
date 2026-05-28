import { useCoreContext } from '@integration-components/core/preact';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import { TranslationKey } from '@integration-components/core';
import { ErrorMessageDisplay } from '@integration-components/ui-components-preact/ErrorMessageDisplay/ErrorMessageDisplay';
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
