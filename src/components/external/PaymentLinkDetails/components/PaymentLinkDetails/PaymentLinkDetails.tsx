import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import ButtonActions from '../../../../../components/internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { EMPTY_OBJECT } from '../../../../../utils';
import Header from '../../../../../components/internal/Header';
import { PaymentLinkDetailsProps as PaymentLinkDetailsElementProps } from '../../types';
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
import Icon from '../../../../internal/Icon';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../internal/Typography/types';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-details',
    content: 'adyen-pe-payment-link-details__content',
    expirationSuccessContainer: 'adyen-pe-payment-link-details__expiration-success-container',
    expirationSuccessIcon: 'adyen-pe-payment-link-details__expiration-success-icon',
};

type PaymentLinkDetailsProps = Omit<ExternalUIComponentProps<PaymentLinkDetailsElementProps>, 'onDismiss'> & {
    onDismiss?: (withUpdate?: boolean) => void;
};

export const PaymentLinkDetails = ({ id, onUpdate, hideTitle, onContactSupport, onDismiss }: PaymentLinkDetailsProps) => {
    const { i18n, getCdnDataset } = useCoreContext();
    const { getPayByLinkPaymentLinkById } = useConfigContext().endpoints;
    const {
        data: paymentLinkData,
        isFetching: isFetchingPaymentLinkData,
        error: paymentLinkDataError,
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

    const isFetching = isFetchingPaymentLinkData || isFetchingCountries;
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
    const [activeScreen, setActiveScreen] = useState<'details' | 'expirationConfirmation' | 'expirationSuccess'>('details');
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

    const handleExpireNow = useCallback(() => {
        setActiveScreen('expirationConfirmation');
    }, []);

    const handleExpirationSuccess = useCallback(() => {
        setActiveScreen('expirationSuccess');
    }, []);

    const handleNavigationToDetailsAfterExpiration = useCallback(() => {
        setActiveScreen('details');
        refetch();
        onUpdate?.();
    }, [onUpdate, refetch]);

    const handleNavigationToListAfterExpiration = useCallback(() => {
        onDismiss?.(true);
    }, [onDismiss]);

    const { withinModal } = useModalContext();

    const renderContent = useCallback(() => {
        if (isFetching) {
            return <PaymentLinkSkeleton />;
        }

        if (!paymentLink || paymentLinkDataError) {
            return (
                <PaymentLinkError
                    error={paymentLinkDataError as AdyenPlatformExperienceError}
                    onDismiss={onDismiss}
                    onContactSupport={onContactSupport}
                />
            );
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

        if (activeScreen === 'expirationSuccess') {
            const actionButtons: ButtonActionsList = [
                ...(onDismiss
                    ? [
                          {
                              title: i18n.get('paymentLinks.details.expirationSuccess.actions.goBackToList'),
                              event: handleNavigationToListAfterExpiration,
                              variant: ButtonVariant.SECONDARY,
                          },
                      ]
                    : []),
                {
                    title: i18n.get('paymentLinks.details.expirationSuccess.actions.showDetails'),
                    event: handleNavigationToDetailsAfterExpiration,
                    variant: ButtonVariant.SECONDARY,
                },
            ];
            return (
                <div className={CLASSNAMES.expirationSuccessContainer}>
                    <Icon name="checkmark-circle-fill" className={CLASSNAMES.expirationSuccessIcon} />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('paymentLinks.details.expirationSuccess.title')}</Typography>
                    <Typography variant={TypographyVariant.BODY}>{i18n.get('paymentLinks.details.expirationSuccess.description')}</Typography>
                    <ButtonActions actions={actionButtons} />
                </div>
            );
        }

        if (activeScreen === 'details') {
            const actionButtons: ButtonActionsList = [
                {
                    title: i18n.get(isCopiedIndicatorVisible ? 'paymentLinks.details.actions.copied' : 'paymentLinks.details.actions.copyLink'),
                    event: handleCopyLink,
                    variant: ButtonVariant.PRIMARY,
                    disabled: isCopiedIndicatorVisible,
                    iconLeft: (
                        <Icon
                            className="adyen-pe-pay-by-link-creation-form-success__button-icon"
                            name={isCopiedIndicatorVisible ? 'checkmark' : 'copy'}
                        />
                    ),
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

            return (
                <>
                    <PaymentLinkSummary paymentLink={paymentLink} />
                    <PaymentLinkTabs paymentLink={paymentLink} />
                    <ButtonActions actions={actionButtons} />
                </>
            );
        }
    }, [
        isFetching,
        paymentLink,
        paymentLinkDataError,
        activeScreen,
        onDismiss,
        onContactSupport,
        handleExpirationSuccess,
        i18n,
        handleNavigationToListAfterExpiration,
        handleNavigationToDetailsAfterExpiration,
        isCopiedIndicatorVisible,
        handleCopyLink,
        handleExpireNow,
    ]);

    return (
        <div className={CLASSNAMES.root}>
            <div className={cx({ ['adyen-pe-visually-hidden']: activeScreen !== 'details' })}>
                <Header hideTitle={hideTitle} forwardedToRoot={!withinModal} titleKey={'paymentLinks.details.title'} />
            </div>
            <div className={CLASSNAMES.content}>{renderContent()}</div>
        </div>
    );
};
