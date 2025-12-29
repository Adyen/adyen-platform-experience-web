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
import { PaymentLinkTabs } from '../PaymentLinkTabs/PaymentLinkTabs';
import { ButtonActionsList } from '../../../../internal/Button/ButtonActions/types';
import { PaymentLinkExpiration } from '../PaymentLinkExpiration/PaymentLinkExpiration';
import './PaymentLinkDetails.scss';
import { PaymentLinkSkeleton } from '../PaymentLinkSkeleton/PaymentLinkSkeleton';
import { PaymentLinkError } from '../PaymentLinkError/PaymentLinkError';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-details',
    content: 'adyen-pe-payment-link-details__content',
};

export const PaymentLinkDetails = ({ id, onUpdate, hideTitle, onContactSupport, onDismiss }: ExternalUIComponentProps<PaymentLinkDetailsProps>) => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { getPayByLinkPaymentLinkById } = useConfigContext().endpoints;
    const {
        data: paymentLinkData,
        isFetching: isFetchingPaymentLink,
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

    const { data: countries, isFetching: isFetchingCountries } = useFetch({
        queryFn: useCallback(async () => {
            const fileName = `${i18n.locale ?? 'en-US'}`;
            if (getCdnDataset) {
                return (
                    (await getCdnDataset<Array<{ id: string; name: string }>>({
                        name: fileName,
                        extension: 'json',
                        subFolder: 'countries',
                        fallback: [] as Array<{ id: string; name: string }>,
                    })) ?? []
                );
            }
            return [] as Array<{ id: string; name: string }>;
        }, [getCdnDataset, i18n.locale]),
    });

    const getCountryName = useCallback(
        (countryCode: string) => {
            const country = countries?.find(country => country.id === countryCode);
            return country?.name;
        },
        [countries]
    );

    const isFetching = isFetchingPaymentLink || isFetchingCountries;
    const paymentLink = useMemo(
        () =>
            paymentLinkData && {
                ...paymentLinkData,
                shopperInformation: {
                    ...paymentLinkData?.shopperInformation,
                    shopperCountry:
                        paymentLinkData?.shopperInformation?.shopperCountry && getCountryName(paymentLinkData?.shopperInformation.shopperCountry),
                },
            },
        [paymentLinkData, getCountryName]
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

    const handleExpirationSuccess = useCallback(() => {
        setActiveScreen('details');
        refetch();
        onUpdate?.();
    }, [onUpdate, refetch]);

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

    const renderContent = useCallback(() => {
        if (isFetching) {
            return <PaymentLinkSkeleton />;
        }

        if (!paymentLink || error) {
            return 'error';
        }

        if (activeScreen === 'expirationConfirmation') {
            return (
                <PaymentLinkExpiration
                    paymentLink={paymentLink}
                    onCancel={() => setActiveScreen('details')}
                    onExpirationSuccess={handleExpirationSuccess}
                />
            );
        }

        return (
            <>
                <PaymentLinkSummary paymentLink={paymentLink} />
                <PaymentLinkTabs paymentLink={paymentLink} />
                {actionButtons.length > 0 && <ButtonActions actions={actionButtons} />}
            </>
        );
    }, [actionButtons, activeScreen, error, handleExpirationSuccess, isFetching, onContactSupport, onDismiss, paymentLink]);

    return (
        <div className={CLASSNAMES.root}>
            <div className={cx({ ['adyen-pe-visually-hidden']: activeScreen !== 'details' })}>
                <Header hideTitle={hideTitle} forwardedToRoot={!withinModal} titleKey={'paymentLinks.details.title'} />
            </div>
            <div className={CLASSNAMES.content}>{renderContent()}</div>
        </div>
    );
};
