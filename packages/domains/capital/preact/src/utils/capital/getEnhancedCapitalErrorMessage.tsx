import { JSX } from 'preact';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import { ErrorMessage } from '@integration-components/ui-components-preact/utils/getCommonErrorCode';
import CopyText from '@integration-components/ui-components-preact/CopyText/CopyText';
import { COMMON_CAPITAL_ERROR_MESSAGE, getCapitalErrorMessage } from '@integration-components/capital/domain';

export { COMMON_CAPITAL_ERROR_MESSAGE };

export const getEnhancedCapitalErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage => {
    const capitalErrorMessage = getCapitalErrorMessage(error, onContactSupport);

    const getTranslationValue = (requestId: string): JSX.Element | null => (
        <CopyText isUnderlineVisible copyButtonAriaLabelKey="common.actions.copy.labels.errorCode" textToCopy={requestId} />
    );

    const { translationValues: stringTranslationValues, ...errorMessage } = capitalErrorMessage;
    if (!stringTranslationValues) return errorMessage;

    const translationValues: ErrorMessage['translationValues'] = Object.fromEntries(
        Object.entries(stringTranslationValues).map(([key, value]) => [key, getTranslationValue(value)])
    );

    return { ...errorMessage, translationValues };
};
