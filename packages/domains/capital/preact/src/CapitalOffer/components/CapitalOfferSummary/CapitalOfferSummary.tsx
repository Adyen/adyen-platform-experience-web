import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { AdyenErrorResponse } from '@integration-components/core';
import { IGrantOfferResponseDTO, ButtonVariant } from '@integration-components/types';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@integration-components/utils';
import {
    EnhancedCapitalState,
    getIsEarlyRenewal,
    OnFundsRequestCallback,
    sharedCapitalOfferAnalyticsEventProperties,
} from '@integration-components/capital/domain';
import Button from '@integration-components/ui-components-preact/Button/Button';
import useMutation from '@integration-components/hooks-preact/useMutation/useMutation';
import { AlertTypeOption } from '@integration-components/ui-components-preact/Alert/types';
import Alert from '@integration-components/ui-components-preact/Alert/Alert';
import { CapitalErrorMessageDisplay } from '../../../internal/CapitalErrorMessageDisplay';
import { CapitalOfferLegalNotice } from '../CapitalOfferLegalNotice/CapitalOfferLegalNotice';
import './CapitalOfferSummary.scss';
import { CapitalHighlightedFields } from '../CapitalHighlightedFields/CapitalHighlightedFields';
import { RenewalHighlightedFields } from '../RenewalHighlightedFields';
import { CapitalOfferTerms } from '../CapitalOfferTerms/CapitalOfferTerms';

const BALANCE_ACCOUNT_ERROR_CODE = '30_013';

const grantSummaryAmountConfig = { minimumFractionDigits: 0 };

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing summary',
} as const;

type CapitalOfferSummaryProps = {
    grantOffer: IGrantOfferResponseDTO;
    capitalState?: EnhancedCapitalState;
    onBack: () => void;
    onFundsRequest?: OnFundsRequestCallback;
    onContactSupport?: () => void;
};

export const CapitalOfferSummary = ({ grantOffer, capitalState, onBack, onFundsRequest, onContactSupport }: CapitalOfferSummaryProps) => {
    const { i18n } = useCoreContext();
    const { requestFunds } = useConfigContext().endpoints;
    const userEvents = useEventDispatcherContext();

    const isEarlyRenewal = useMemo(() => capitalState && getIsEarlyRenewal(capitalState), [capitalState]);
    const renewableGrant = useMemo(() => capitalState?.renewableGrants[0], [capitalState?.renewableGrants]);
    const renewsGrantId = useMemo(() => renewableGrant?.id, [renewableGrant]);
    const financingAmount = i18n.amount(grantOffer.grantAmount.value, grantOffer.grantAmount.currency, grantSummaryAmountConfig);
    const highlightedFields = [
        {
            label: i18n.get('capital.common.fields.financing'),
            value: financingAmount,
        },
        {
            label: i18n.get('capital.common.fields.fees'),
            value: i18n.amount(grantOffer.feesAmount.value, grantOffer.feesAmount.currency, grantSummaryAmountConfig),
        },
        {
            label: i18n.get('capital.common.fields.totalRepaymentAmount'),
            value: i18n.amount(grantOffer.totalAmount.value, grantOffer.totalAmount.currency, grantSummaryAmountConfig),
        },
    ];

    const requestFundsMutation = useMutation({
        queryFn: requestFunds,
        options: {
            onSuccess: data => {
                onFundsRequest?.(data, renewsGrantId);
            },
        },
    });

    const balanceAccountError = useMemo(() => {
        const error = requestFundsMutation.error && (requestFundsMutation.error as AdyenErrorResponse);
        if (!error || error.errorCode !== BALANCE_ACCOUNT_ERROR_CODE) return undefined;
        return {
            title: i18n.get('capital.offer.common.errors.noPrimaryAccount'),
            message: i18n.get('capital.offer.common.errors.cannotContinueSupport'),
        };
    }, [i18n, requestFundsMutation.error]);

    const handleRequestFundsButtonClick = useCallback(() => {
        if (grantOffer.id) {
            requestFundsMutation.mutate(
                {
                    body: renewsGrantId ? { renewsGrantId } : EMPTY_OBJECT,
                    contentType: 'application/json',
                },
                { path: { grantOfferId: grantOffer.id } }
            );
        }
        userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Request funds', isEarlyRenewal });
    }, [grantOffer.id, userEvents, isEarlyRenewal, requestFundsMutation, renewsGrantId]);

    const handleBackButtonClick = useCallback(() => {
        onBack();
        userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Back to slider view', isEarlyRenewal });
    }, [onBack, userEvents, isEarlyRenewal]);

    return !balanceAccountError && requestFundsMutation.error ? (
        <CapitalErrorMessageDisplay error={requestFundsMutation.error} onBack={handleBackButtonClick} onContactSupport={onContactSupport} />
    ) : (
        <div className="adyen-pe-capital-offer-summary">
            <div className="adyen-pe-capital-offer-summary__highlighted-fields">
                {renewableGrant && (
                    <RenewalHighlightedFields remainingGrantAmount={renewableGrant?.remainingGrantAmount} newGrantAmount={grantOffer.grantAmount} />
                )}
                <CapitalHighlightedFields fields={highlightedFields} />
            </div>
            <CapitalOfferTerms capitalState={capitalState} grantOffer={grantOffer} hasBalanceAccountError={!!balanceAccountError} />
            {balanceAccountError && (
                <Alert
                    className={'adyen-pe-capital-offer-summary__error-alert'}
                    type={AlertTypeOption.WARNING}
                    title={balanceAccountError.title}
                    description={balanceAccountError.message}
                >
                    {onContactSupport ? (
                        <Button className={'adyen-pe-capital-offer-summary__error-alert-button'} onClick={onContactSupport}>
                            {i18n.get('capital.common.actions.contactSupport')}
                        </Button>
                    ) : null}
                </Alert>
            )}
            <CapitalOfferLegalNotice region={capitalState?.region} />
            {isEarlyRenewal && (
                <Alert
                    type={AlertTypeOption.HIGHLIGHT}
                    title={i18n.get('capital.offer.summary.earlyRenewalNotice.title')}
                    description={i18n.get('capital.offer.summary.earlyRenewalNotice.description')}
                />
            )}
            <div className="adyen-pe-capital-offer-summary__buttons">
                <Button variant={ButtonVariant.SECONDARY} onClick={handleBackButtonClick}>
                    {i18n.get('capital.common.actions.goBack')}
                </Button>
                <Button
                    variant={ButtonVariant.PRIMARY}
                    state={requestFundsMutation.isLoading ? 'loading' : undefined}
                    onClick={handleRequestFundsButtonClick}
                    disabled={requestFundsMutation.isLoading || !!requestFundsMutation.error || !!requestFundsMutation.data}
                >
                    {requestFundsMutation.isLoading
                        ? i18n.get('capital.offer.summary.actions.requestFunds.states.loading')
                        : i18n.get('capital.offer.summary.actions.requestFundsWithAmount', {
                              values: { amount: financingAmount },
                          })}
                </Button>
            </div>
        </div>
    );
};
