import { getCapitalErrorMessage } from '../../../../utils/capital/getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { useCallback } from 'preact/hooks';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AdyenErrorResponse } from '../../../../../core/Http/types';

export const CapitalErrorMessageDisplay = ({
    onBack,
    error,
    onContactSupport,
}: {
    onBack: () => void;
    error: Error | AdyenErrorResponse | null;
    onContactSupport?: () => void;
}) => {
    const { i18n } = useCoreContext();

    const onBackButton = useCallback(
        () => (
            <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                {i18n.get('capital.back')}
            </Button>
        ),
        [i18n, onBack]
    );

    return (
        <ErrorMessageDisplay
            absolutePosition={false}
            withImage
            renderSecondaryButton={onBackButton}
            outlined={false}
            {...getCapitalErrorMessage(error as AdyenPlatformExperienceError, onContactSupport)}
        />
    );
};
