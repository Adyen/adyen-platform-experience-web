import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useState, useMemo, useEffect, useCallback } from 'preact/hooks';
import ButtonActions from '../../../../../components/internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import Header from '../../../../../components/internal/Header';
import { PaymentLinkDetailsProps } from '../../types';
import { ExternalUIComponentProps } from 'src/components/types';
import { useModalContext } from '../../../../internal/Modal/Modal';
import { PaymentLinkSummary } from '../PaymentLinkSummary/PaymentLinkSummary';
import './PaymentLinkDetails.scss';
import { PaymentLinkExpiration } from '../PaymentLinkExpiration/PaymentLinkExpiration';
import { PaymentLinkTabs } from '../PaymentLinkTabs/PaymentLinkTabs';
import { ButtonActionsList } from '../../../../../components/internal/Button/ButtonActions/types';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-details',
    content: 'adyen-pe-payment-link-details__content',
};

export const PaymentLinkDetails = ({ id, onUpdate, hideTitle }: ExternalUIComponentProps<PaymentLinkDetailsProps>) => {
    const { i18n } = useCoreContext();
    const { getPayByLinkPaymentLinkById } = useConfigContext().endpoints;
    const {
        data: paymentLink,
        isFetching,
        error,
        refetch,
    } = useFetch(
        useMemo(
            () => ({
                fetchOptions: {
                    enabled: !!id && !!getPayByLinkPaymentLinkById,
                },
                queryFn: async () => {
                    return getPayByLinkPaymentLinkById!(EMPTY_OBJECT, {
                        path: {
                            paymentLinkId: id,
                        },
                    });
                },
            }),
            [getPayByLinkPaymentLinkById, id]
        )
    );

    const [activeScreen, setActiveScreen] = useState<'details' | 'expirationConfirmation'>('details');
    const [isCopiedIndicatorVisible, setCopiedIndicatorVisible] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        if (isCopiedIndicatorVisible) {
            timeout = setTimeout(() => setCopiedIndicatorVisible(false), 1000);
        }

        return () => clearTimeout(timeout);
    }, [isCopiedIndicatorVisible]);

    const handleCopyLink = useCallback(async () => {
        if (!paymentLink) return;

        try {
            await navigator.clipboard.writeText(paymentLink.linkInformation.paymentLink);
            setCopiedIndicatorVisible(true);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    }, [paymentLink]);

    const handleExpireNow = async () => {
        setActiveScreen('expirationConfirmation');
    };

    const handleExpirationSuccess = () => {
        setActiveScreen('details');
        refetch();
        onUpdate?.();
    };

    const actionButtons: ButtonActionsList = useMemo(() => {
        if (!paymentLink) return [];
        return [
            {
                title: i18n.get(isCopiedIndicatorVisible ? 'paymentLinks.details.actions.copied' : 'paymentLinks.details.actions.copyLink'),
                event: handleCopyLink,
                variant: ButtonVariant.PRIMARY,
                disabled: isCopiedIndicatorVisible,
            },
            ...(paymentLink.linkInformation.status !== 'expired' && paymentLink.linkInformation.status !== 'completed'
                ? [
                      {
                          title: i18n.get('paymentLinks.details.actions.expire'),
                          event: handleExpireNow,
                          variant: ButtonVariant.SECONDARY,
                      },
                  ]
                : []),
        ];
    }, [handleCopyLink, i18n, isCopiedIndicatorVisible, paymentLink]);

    const { withinModal } = useModalContext();

    if (isFetching) {
        return 'loading';
    }

    if (!paymentLink || error) {
        return 'error';
    }

    return (
        <div className={CLASSNAMES.root}>
            <div className={cx({ ['adyen-pe-visually-hidden']: activeScreen !== 'details' })}>
                <Header hideTitle={hideTitle} forwardedToRoot={!withinModal} titleKey={'paymentLinks.details.title'} />
            </div>

            <div className={CLASSNAMES.content}>
                {activeScreen === 'expirationConfirmation' && (
                    <PaymentLinkExpiration
                        paymentLink={paymentLink}
                        onCancel={() => setActiveScreen('details')}
                        onExpirationSuccess={handleExpirationSuccess}
                    />
                )}

                {activeScreen === 'details' && (
                    <>
                        <PaymentLinkSummary paymentLink={paymentLink} />
                        <PaymentLinkTabs paymentLink={paymentLink} />
                        {actionButtons.length > 0 && <ButtonActions actions={actionButtons} />}
                    </>
                )}
            </div>
        </div>
    );
};
