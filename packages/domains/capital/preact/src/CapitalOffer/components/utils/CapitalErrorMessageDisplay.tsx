import { getCapitalErrorMessage } from '../../../utils/capital/getCapitalErrorMessage';
import { AdyenPlatformExperienceError, AdyenErrorResponse, ErrorTypes } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/preact';
import { ErrorMessageDisplay } from '@integration-components/ui-components-preact/ErrorMessageDisplay/ErrorMessageDisplay';
import { useCallback, useMemo } from 'preact/hooks';
import Button from '@integration-components/ui-components-preact/Button/Button';
import { ButtonVariant } from '@integration-components/types';

export const CapitalErrorMessageDisplay = ({
    emptyGrantOffer,
    error,
    onContactSupport,
    onBack,
    unsupportedRegion,
}: {
    emptyGrantOffer?: boolean;
    error?: Error | AdyenErrorResponse;
    onBack?: () => void;
    onContactSupport?: () => void;
    unsupportedRegion?: boolean;
}) => {
    const { i18n, getImageAsset } = useCoreContext();

    const renderSecondaryButton = useCallback(
        () => (
            <>
                {onBack && (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                        {i18n.get('capital.common.actions.goBack')}
                    </Button>
                )}
            </>
        ),
        [i18n, onBack]
    );

    const capitalError = useMemo(() => {
        if (unsupportedRegion) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'UnsupportedRegion', 'Unsupported Region', 'UNSUPPORTED_REGION');
        }
        if (emptyGrantOffer) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'NoOffer', 'No Offer', 'NO_OFFER');
        }
        return error;
    }, [emptyGrantOffer, unsupportedRegion, error]);

    if (emptyGrantOffer) {
        return (
            <ErrorMessageDisplay
                absolutePosition={false}
                imageDesktop={getImageAsset?.({ name: 'no-results-found' })}
                imageMobile={getImageAsset?.({ name: 'no-results-found', subFolder: 'images/small' })}
                outlined={false}
                {...getCapitalErrorMessage(capitalError as AdyenPlatformExperienceError, onContactSupport)}
            />
        );
    }

    return (
        <ErrorMessageDisplay
            absolutePosition={false}
            withImage
            onContactSupport={onContactSupport}
            renderSecondaryButton={renderSecondaryButton}
            outlined={false}
            {...getCapitalErrorMessage(capitalError as AdyenPlatformExperienceError, onContactSupport)}
        />
    );
};
