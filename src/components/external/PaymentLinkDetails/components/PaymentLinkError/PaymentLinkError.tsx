import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { ButtonVariant } from '@integration-components/ui-primitives-preact/Button/types';
import { ErrorMessageDisplay } from '@integration-components/ui-primitives-preact/ErrorMessageDisplay/ErrorMessageDisplay';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import Button from '@integration-components/ui-primitives-preact/Button/Button';
import { getPaymentLinkErrorMessage } from './getPaymentLinkErrorMessage';

type PaymentLinkErrorProps = {
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    onDismiss?: () => void;
};

export const PaymentLinkError = ({ error, onContactSupport, onDismiss }: PaymentLinkErrorProps) => {
    const { i18n } = useCoreContext();

    const renderBackButton = useCallback(() => {
        return (
            <Button variant={ButtonVariant.SECONDARY} onClick={onDismiss}>
                {i18n.get('payByLink.common.actions.goBack')}
            </Button>
        );
    }, [i18n, onDismiss]);

    const errorProps = useMemo(
        () => getPaymentLinkErrorMessage(error as AdyenPlatformExperienceError, 'payByLink.details.errors.unavailable', onContactSupport),
        [error, onContactSupport]
    );

    return (
        <ErrorMessageDisplay
            renderSecondaryButton={onDismiss ? renderBackButton : undefined}
            withImage
            outlined={false}
            absolutePosition={false}
            withBackground={false}
            {...errorProps}
        />
    );
};
