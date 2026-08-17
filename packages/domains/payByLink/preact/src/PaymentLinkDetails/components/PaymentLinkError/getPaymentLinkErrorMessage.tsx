import { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import { ErrorMessage } from '@integration-components/ui-components-preact/utils/getCommonErrorCode';
import CopyText from '@integration-components/ui-components-preact/CopyText/CopyText';
import { getPaymentLinkErrorMessageContent } from '@integration-components/payByLink/domain';

export const getPaymentLinkErrorMessage = (
    error: AdyenPlatformExperienceError,
    errorMessage: TranslationKey,
    onContactSupport?: () => void
): ErrorMessage => {
    const content = getPaymentLinkErrorMessageContent(error, errorMessage, !!onContactSupport);
    const is500Error = !!error && error.errorCode === '500';
    const secondaryErrorMessage = content.message[1];

    return {
        title: content.title,
        message: content.message,
        refreshComponent: content.refreshComponent,
        ...(is500Error && {
            onContactSupport,
            translationValues: {
                [secondaryErrorMessage!]: content.requestId ? (
                    <CopyText isUnderlineVisible copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={content.requestId} />
                ) : null,
            },
        }),
    };
};
