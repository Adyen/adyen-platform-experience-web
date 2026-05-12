import { ErrorMessageDisplay } from '@integration-components/ui-components-preact/ErrorMessageDisplay/ErrorMessageDisplay';
import { getPaymentLinksErrorMessage } from '../utils/getPaymentLinksErrorMessage';
import { TranslationKey } from '@integration-components/core';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import { AssetOptions } from '@integration-components/core';

export const PaymentLinksErrors = ({
    error,
    errorMessage,
    onContactSupport,
    getImageAsset,
}: {
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: TranslationKey;
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
    } = getPaymentLinksErrorMessage(error, errorMessage, onContactSupport, getImageAsset);
    return (
        <ErrorMessageDisplay
            imageDesktop={images?.desktop}
            imageMobile={images?.mobile}
            withHeaderOffset
            title={title}
            message={message}
            translationValues={translationValues}
            withImage
            centered
            refreshComponent={refreshComponent}
            onContactSupport={ContactSupport}
        />
    );
};
