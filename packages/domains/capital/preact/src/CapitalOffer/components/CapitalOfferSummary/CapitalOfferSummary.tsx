import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { AdyenErrorResponse, TranslationKey } from '@integration-components/core';
import { IGrantOfferResponseDTO, ButtonVariant } from '@integration-components/types';
import { useCallback, useMemo } from 'preact/hooks';
import { useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { DATE_FORMAT_CAPITAL_OVERVIEW, EMPTY_OBJECT } from '@integration-components/utils';
import { getMaximumRepaymentDate, getPercentage } from '../utils/utils';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import StructuredList from '@integration-components/ui-components-preact/StructuredList';
import { ListValue, StructuredListItem } from '@integration-components/ui-components-preact/StructuredList/types';
import Tabs from '@integration-components/ui-components-preact/Tabs/Tabs';
import Button from '@integration-components/ui-components-preact/Button/Button';
import useMutation from '@integration-components/hooks-preact/useMutation/useMutation';
import { Tooltip } from '@integration-components/ui-components-preact/Tooltip/Tooltip';
import { AlertTypeOption } from '@integration-components/ui-components-preact/Alert/types';
import Alert from '@integration-components/ui-components-preact/Alert/Alert';
import Icon from '@integration-components/ui-components-preact/Icon';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import cx from 'classnames';
import { sharedCapitalOfferAnalyticsEventProperties } from '../CapitalOffer/constants';
import { CAPITAL_REPAYMENT_FREQUENCY } from '@integration-components/capital/domain';
import { CapitalOfferLegalNotice } from '../CapitalOfferLegalNotice/CapitalOfferLegalNotice';
import { useFormatTermLabel } from '../hooks/useFormatTermLabel';
import './CapitalOfferSummary.scss';
import { CapitalHighlightedFields } from '../CapitalHighlightedFields/CapitalHighlightedFields';
import { TabProps } from '@integration-components/ui-components-preact/Tabs/types';
import { EnhancedCapitalState } from '../../../utils/capital/getCapitalState';
import { OnFundsRequestCallback } from '../../../types';

const errorMessageWithAlert = ['30_013'];
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
    const userEvents = useEventDispatcherContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const formatTermLabel = useFormatTermLabel();

    const { requestFunds } = useConfigContext().endpoints;
    const renewsGrantId = useMemo(() => capitalState?.renewableGrants[0]?.id, [capitalState?.renewableGrants]);

    const requestFundsMutation = useMutation({
        queryFn: requestFunds,
        options: {
            onSuccess: data => {
                onFundsRequest?.(data, renewsGrantId);
            },
        },
    });

    const requestFundsCallback = useCallback(
        (id: string) => {
            void requestFundsMutation.mutate(
                {
                    body: renewsGrantId ? { renewsGrantId } : EMPTY_OBJECT,
                    contentType: 'application/json',
                },
                { path: { grantOfferId: id } }
            );
        },
        [renewsGrantId, requestFundsMutation]
    );

    const onRequestFundsHandler = useCallback(() => {
        try {
            if (grantOffer.id) {
                requestFundsCallback(grantOffer.id);
            }
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Request funds' });
        }
    }, [grantOffer.id, requestFundsCallback, userEvents]);

    const onBackWithTracking = useCallback<typeof onBack>(() => {
        try {
            return onBack();
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'Back to slider view' });
        }
    }, [onBack, userEvents]);

    const requestErrorAlert = useMemo<{ title: string; message: string; errorCode?: string } | null>(() => {
        const err = requestFundsMutation.error ? (requestFundsMutation.error as AdyenErrorResponse) : null;

        if (err && errorMessageWithAlert.includes(err.errorCode)) {
            switch (err.errorCode) {
                case '30_013':
                    return {
                        title: i18n.get('capital.offer.common.errors.noPrimaryAccount'),
                        message: i18n.get('capital.offer.common.errors.cannotContinueSupport'),
                        errorCode: '30_013',
                    };
                default:
                    return {
                        title: i18n.get('common.errors.somethingWentWrong'),
                        message: i18n.get('capital.offer.common.errors.unavailable'),
                    };
            }
        }

        return null;
    }, [i18n, requestFundsMutation.error]);

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

    const getStructuredListItems = useCallback(
        (grant: IGrantOfferResponseDTO) => {
            const days = grant.maximumRepaymentPeriodDays;
            const date = days && getMaximumRepaymentDate(days);
            const maximumRepaymentPeriodDate = date && dateFormat(date, DATE_FORMAT_CAPITAL_OVERVIEW);

            return [
                ...(capitalState?.renewableGrants.length
                    ? [
                          {
                              key: 'capital.common.fields.financing',
                              value: i18n.amount(grant.grantAmount.value, grant.grantAmount.currency),
                          },
                          {
                              key: 'capital.common.fields.fees',
                              value: i18n.amount(grant.feesAmount.value, grant.feesAmount.currency),
                          },
                          {
                              key: 'capital.common.fields.totalRepaymentAmount',
                              value: i18n.amount(grant.totalAmount.value, grant.totalAmount.currency),
                          },
                      ]
                    : []),
                {
                    key: 'capital.common.fields.dailyRepaymentRate',
                    value: i18n.get('capital.common.values.percentage', { values: { percentage: getPercentage(grant.repaymentRate) } }),
                },
                ...(grant.aprBasisPoints
                    ? [
                          {
                              key: 'capital.common.fields.annualPercentageRate' as const,
                              value: i18n.get('capital.common.values.percentage', {
                                  values: { percentage: getPercentage(grant.aprBasisPoints) },
                              }),
                          },
                      ]
                    : []),
                {
                    key: 'capital.common.fields.repaymentThreshold',
                    value: i18n.amount(grant.thresholdAmount.value, grant.thresholdAmount.currency),
                },
                {
                    key: 'capital.common.fields.expectedRepaymentPeriod',
                    value: formatTermLabel(grant.expectedRepaymentPeriodDays),
                },
                ...(maximumRepaymentPeriodDate
                    ? [
                          {
                              key: 'capital.common.fields.maximumRepaymentDate' as const,
                              value: maximumRepaymentPeriodDate,
                          },
                      ]
                    : []),
                { key: 'capital.common.fields.account', value: i18n.get('capital.common.values.primaryAccount') },
            ] as StructuredListItem[];
        },
        [dateFormat, capitalState?.renewableGrants.length, i18n, formatTermLabel]
    );

    const renderLabel = useCallback(
        (val: string, key: TranslationKey) => {
            if (key === 'capital.common.fields.repaymentThreshold') {
                return (
                    <Tooltip
                        isUnderlineVisible
                        content={i18n.get('capital.common.fields.repaymentThreshold.description', {
                            values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                        })}
                    >
                        <span>
                            <Typography
                                className={'adyen-pe-capital-offer-summary__list-label'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                            >
                                {val}
                            </Typography>
                        </span>
                    </Tooltip>
                );
            }
            if (key === 'capital.common.fields.annualPercentageRate') {
                return (
                    <Tooltip isUnderlineVisible content={i18n.get('capital.common.fields.annualPercentageRate.description')}>
                        <span>
                            <Typography
                                className={'adyen-pe-capital-offer-summary__list-label'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                            >
                                {val}
                            </Typography>
                        </span>
                    </Tooltip>
                );
            }
            return (
                <Typography className={'adyen-pe-capital-offer-summary__list-label'} el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {val}
                </Typography>
            );
        },
        [i18n]
    );

    const renderValue = useCallback(
        (val: ListValue, key: TranslationKey) => {
            const showWarningIcon =
                key === 'capital.common.fields.account' &&
                requestFundsMutation.error &&
                requestErrorAlert &&
                requestErrorAlert.errorCode === '30_013';
            return (
                <Typography
                    className={cx({ ['adyen-pe-capital-offer-summary__details--error']: showWarningIcon })}
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.CAPTION}
                    stronger
                >
                    {showWarningIcon ? <Icon name={'warning-filled'} data-testid={'primary-account-warning-icon'} /> : null}
                    {val}
                </Typography>
            );
        },
        [requestErrorAlert, requestFundsMutation.error]
    );

    const currentSimplifiedGrant = useMemo(() => {
        const currentGrant = capitalState?.renewableGrants[0];
        return (
            currentGrant &&
            ({
                expectedRepaymentPeriodDays: currentGrant.expectedRepaymentPeriodDays,
                feesAmount: currentGrant.feesAmount,
                grantAmount: currentGrant.grantAmount,
                id: currentGrant.id,
                maximumRepaymentPeriodDays: currentGrant.maximumRepaymentPeriodDays,
                repaymentRate: currentGrant.repaymentRate,
                thresholdAmount: currentGrant.thresholdAmount,
                totalAmount: currentGrant.totalAmount,
            } as IGrantOfferResponseDTO)
        );
    }, [capitalState?.renewableGrants]);

    const tabs = useMemo<TabProps<string>[]>(
        () => [
            {
                id: 'newLoan',
                label: 'capital.offer.summary.earlyRenewal.tabs.newGrant',
                content: (
                    <StructuredList
                        classNames="adyen-pe-capital-offer-summary__details"
                        renderLabel={renderLabel}
                        renderValue={renderValue}
                        items={getStructuredListItems(grantOffer)}
                    />
                ),
            },
            {
                id: 'currentLoan',
                label: 'capital.offer.summary.earlyRenewal.tabs.currentGrant',
                content: (
                    <>
                        <StructuredList
                            classNames="adyen-pe-capital-offer-summary__details"
                            renderLabel={renderLabel}
                            renderValue={renderValue}
                            items={currentSimplifiedGrant ? getStructuredListItems(currentSimplifiedGrant) : []}
                        />
                    </>
                ),
            },
        ],
        [currentSimplifiedGrant, getStructuredListItems, grantOffer, renderLabel, renderValue]
    );

    return !requestErrorAlert && requestFundsMutation.error ? (
        <CapitalErrorMessageDisplay error={requestFundsMutation.error} onBack={onBackWithTracking} onContactSupport={onContactSupport} />
    ) : (
        <div className="adyen-pe-capital-offer-summary">
            <CapitalHighlightedFields fields={highlightedFields} align={'center'} />
            <div className="adyen-pe-capital-offer-summary__terms">
                {capitalState?.renewableGrants?.length ? (
                    <Tabs tabs={tabs} />
                ) : (
                    <>
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                            {i18n.get('capital.common.termsTitle')}
                        </Typography>
                        <StructuredList
                            classNames="adyen-pe-capital-offer-summary__details"
                            renderLabel={renderLabel}
                            renderValue={renderValue}
                            items={getStructuredListItems(grantOffer)}
                        />
                    </>
                )}
            </div>
            {requestErrorAlert && (
                <Alert
                    className={'adyen-pe-capital-offer-summary__error-alert'}
                    type={AlertTypeOption.WARNING}
                    title={requestErrorAlert.title}
                    description={requestErrorAlert.message}
                >
                    {onContactSupport ? (
                        <Button className={'adyen-pe-capital-offer-summary__error-alert-button'} onClick={onContactSupport}>
                            {i18n.get('capital.common.actions.contactSupport')}
                        </Button>
                    ) : null}
                </Alert>
            )}
            <CapitalOfferLegalNotice />
            {!!capitalState?.renewableGrants.length && (
                <Alert
                    type={AlertTypeOption.HIGHLIGHT}
                    title={i18n.get('capital.offer.summary.earlyRenewalNotice.title')}
                    description={i18n.get('capital.offer.summary.earlyRenewalNotice.description')}
                />
            )}
            <div className="adyen-pe-capital-offer-summary__buttons">
                <Button variant={ButtonVariant.SECONDARY} onClick={onBackWithTracking}>
                    {i18n.get('capital.common.actions.goBack')}
                </Button>
                <Button
                    variant={ButtonVariant.PRIMARY}
                    state={requestFundsMutation.isLoading ? 'loading' : undefined}
                    onClick={onRequestFundsHandler}
                    disabled={requestFundsMutation.isLoading || !!requestFundsMutation.error || !!requestFundsMutation.data}
                >
                    {requestFundsMutation.isLoading
                        ? i18n.get('capital.offer.summary.actions.requestFunds.states.loading')
                        : i18n.get('capital.offer.summary.actions.requestFunds', {
                              values: { amount: financingAmount },
                          })}
                </Button>
            </div>
        </div>
    );
};
