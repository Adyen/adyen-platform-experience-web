import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IGrant, IGrantOfferResponseDTO } from '../../../../../types';
import { useCallback, useMemo } from 'preact/hooks';
import { calculateMaximumRepaymentPeriodInMonths, getPercentage } from '../utils/utils';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import './CapitalOfferSummary.scss';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import useEventDispatcherContext from '../../../../../core/Context/eventDispatcher/useEventDispatcherContext';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { EMPTY_OBJECT } from '../../../../../utils';
import { AdyenErrorResponse } from '../../../../../core/Http/types';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Alert from '../../../../internal/Alert/Alert';
import Icon from '../../../../internal/Icon';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import cx from 'classnames';
import { sharedCapitalOfferAnalyticsEventProperties } from '../CapitalOffer/constants';
import { StructuredListItem } from '../../../../internal/StructuredList/types';
import { CAPITAL_REPAYMENT_FREQUENCY } from '../../../../constants';
import { CapitalOfferLegalNotice } from '../CapitalOfferLegalNotice/CapitalOfferLegalNotice';

const errorMessageWithAlert = ['30_013'];

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOfferAnalyticsEventProperties,
    subCategory: 'Business financing summary',
} as const;

export const CapitalOfferSummary = ({
    grantOffer,
    onBack,
    onFundsRequest,
    onContactSupport,
}: {
    grantOffer: IGrantOfferResponseDTO;
    onBack: () => void;
    onFundsRequest?: (data: IGrant) => void;
    onContactSupport?: () => void;
}) => {
    const { i18n } = useCoreContext();
    const userEvents = useEventDispatcherContext();

    const { requestFunds } = useConfigContext().endpoints;

    const requestFundsMutation = useMutation({
        queryFn: requestFunds,
        options: {
            onSuccess: data => onFundsRequest?.(data),
        },
    });

    const requestFundsCallback = useCallback(
        (id: string) => {
            void requestFundsMutation.mutate(EMPTY_OBJECT, { path: { grantOfferId: id } });
        },
        [requestFundsMutation]
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

    const maximumRepaymentPeriod = useMemo(
        () => calculateMaximumRepaymentPeriodInMonths(grantOffer.maximumRepaymentPeriodDays),
        [grantOffer.maximumRepaymentPeriodDays]
    );

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

    const grantSummaryItems = [
        {
            label: i18n.get('capital.common.fields.financing'),
            value: i18n.amount(grantOffer.grantAmount.value, grantOffer.grantAmount.currency, { minimumFractionDigits: 0 }),
        },
        {
            value: i18n.amount(grantOffer.feesAmount.value, grantOffer.feesAmount.currency),
            label: i18n.get('capital.common.fields.fees'),
        },
        {
            value: i18n.amount(grantOffer.totalAmount.value, grantOffer.totalAmount.currency),
            label: i18n.get('capital.common.fields.totalRepaymentAmount'),
        },
    ];

    const structuredListItems = useMemo(
        () =>
            [
                {
                    key: 'capital.common.fields.dailyRepaymentRate',
                    value: i18n.get('capital.common.values.percentage', { values: { percentage: getPercentage(grantOffer.repaymentRate) } }),
                },
                ...(grantOffer.aprBasisPoints
                    ? [
                          {
                              key: 'capital.common.fields.annualPercentageRate' as const,
                              value: i18n.get('capital.common.values.percentage', {
                                  values: { percentage: getPercentage(grantOffer.aprBasisPoints) },
                              }),
                          },
                      ]
                    : []),
                {
                    key: 'capital.common.fields.repaymentThreshold',
                    value: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
                },
                {
                    key: 'capital.common.fields.expectedRepaymentPeriod',
                    value: i18n.get('capital.common.values.numberOfDays', { values: { days: grantOffer.expectedRepaymentPeriodDays } }),
                },
                ...(maximumRepaymentPeriod
                    ? [
                          {
                              key: 'capital.common.fields.maximumRepaymentDate' as const,
                              value:
                                  maximumRepaymentPeriod === 1
                                      ? i18n.get('capital.common.values.oneMonth')
                                      : i18n.get('capital.common.values.numberOfMonths', { values: { months: maximumRepaymentPeriod } }),
                          },
                      ]
                    : []),
                { key: 'capital.common.fields.account', value: i18n.get('capital.common.values.primaryAccount') },
            ] as StructuredListItem[],
        [grantOffer, i18n, maximumRepaymentPeriod]
    );

    return !requestErrorAlert && requestFundsMutation.error ? (
        <CapitalErrorMessageDisplay error={requestFundsMutation.error} onBack={onBackWithTracking} onContactSupport={onContactSupport} />
    ) : (
        <div className="adyen-pe-capital-offer-summary">
            <div className="adyen-pe-capital-offer-summary__grant-summary">
                {grantSummaryItems.map(({ value, label }) => (
                    <div key={label} className="adyen-pe-capital-offer-summary__grant-summary-item">
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                            {value}
                        </Typography>
                        <Typography
                            className="adyen-pe-capital-offer-summary__grant-summary-label"
                            el={TypographyElement.SPAN}
                            variant={TypographyVariant.CAPTION}
                        >
                            {label}
                        </Typography>
                    </div>
                ))}
            </div>
            <div className="adyen-pe-capital-offer-summary__terms">
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                    {i18n.get('capital.common.termsTitle')}
                </Typography>
                <StructuredList
                    classNames="adyen-pe-capital-offer-summary__details"
                    renderLabel={(val, key) => {
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
                            <Typography
                                className={'adyen-pe-capital-offer-summary__list-label'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                            >
                                {val}
                            </Typography>
                        );
                    }}
                    renderValue={(val, key) => {
                        const showWarningIcon =
                            key === 'capital.common.fields.account' &&
                            requestFundsMutation.error &&
                            requestErrorAlert &&
                            requestErrorAlert.errorCode === '30_013';

                        return (
                            <Typography
                                className={cx({
                                    ['adyen-pe-capital-offer-summary__details--error']: showWarningIcon,
                                })}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                                stronger
                            >
                                {showWarningIcon ? <Icon name={'warning-filled'} data-testid={'primary-account-warning-icon'} /> : null}
                                {val}
                            </Typography>
                        );
                    }}
                    items={structuredListItems}
                />
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
            <div className="adyen-pe-capital-offer-summary__buttons">
                <Button
                    variant={ButtonVariant.PRIMARY}
                    state={requestFundsMutation.isLoading ? 'loading' : undefined}
                    onClick={onRequestFundsHandler}
                    disabled={requestFundsMutation.isLoading || !!requestFundsMutation.error || !!requestFundsMutation.data}
                    aria-label={i18n.get('capital.offer.summary.actions.requestFunds')}
                >
                    {requestFundsMutation.isLoading
                        ? i18n.get('capital.offer.summary.actions.requestFunds.states.loading')
                        : i18n.get('capital.offer.summary.actions.requestFunds', {
                              values: { amount: i18n.amount(grantOffer.totalAmount.value, grantOffer.totalAmount.currency) },
                          })}
                </Button>
                {requestFundsMutation.error && !requestErrorAlert ? null : (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBackWithTracking}>
                        {i18n.get('capital.common.actions.goBack')}
                    </Button>
                )}
            </div>
        </div>
    );
};
