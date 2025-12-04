import InfoBox from '../../../../internal/InfoBox';
import useComponentTiming from '../../../../../hooks/useComponentTiming';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IGrant, IGrantOfferResponseDTO } from '../../../../../types';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { calculateMaximumRepaymentPeriodInMonths, getExpectedRepaymentDate, getPercentage } from '../utils/utils';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import './CapitalOfferSummary.scss';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
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
import { Translation } from '../../../../internal/Translation';

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
    const userEvents = useAnalyticsContext();

    const expectedRepaymentDate = useMemo(() => {
        const date = getExpectedRepaymentDate(grantOffer.expectedRepaymentPeriodDays);
        return date ? i18n.date(date, { month: 'long' }) : null;
    }, [grantOffer, i18n]);

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
            grantOffer.id && requestFundsCallback(grantOffer.id);
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

    const structuredListItems = useMemo(() => {
        const summaryItems: StructuredListItem[] = [
            {
                key: 'capital.common.fields.fees',
                value: i18n.amount(grantOffer.feesAmount.value, grantOffer.feesAmount.currency),
            },
            {
                key: 'capital.common.fields.totalRepaymentAmount',
                value: i18n.amount(grantOffer.totalAmount.value, grantOffer.totalAmount.currency),
            },
            {
                key: 'capital.common.fields.repaymentThreshold',
                value: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
            },
            {
                key: 'capital.common.fields.dailyRepaymentRate',
                value: i18n.get('capital.common.values.percentage', { values: { percentage: getPercentage(grantOffer.repaymentRate) } }),
            },
            {
                key: 'capital.common.fields.expectedRepaymentPeriod',
                value: i18n.get('capital.common.values.numberOfDays', { values: { days: grantOffer.expectedRepaymentPeriodDays } }),
            },
            { key: 'capital.common.fields.account', value: i18n.get('capital.common.values.primaryAccount') },
        ];

        if (maximumRepaymentPeriod) {
            summaryItems.splice(4, 0, {
                key: 'capital.common.fields.maximumRepaymentPeriod',
                value:
                    maximumRepaymentPeriod === 1
                        ? i18n.get('capital.common.values.oneMonth')
                        : i18n.get('capital.common.values.numberOfMonths', { values: { months: maximumRepaymentPeriod } }),
            });
        }

        if (grantOffer.aprBasisPoints) {
            summaryItems.splice(1, 0, {
                key: 'capital.common.fields.annualPercentageRate',
                value: i18n.get('capital.common.values.percentage', { values: { percentage: getPercentage(grantOffer.aprBasisPoints) } }),
            });
        }

        return summaryItems;
    }, [grantOffer, i18n, maximumRepaymentPeriod]);

    const { duration } = useComponentTiming();

    useEffect(() => {
        return () => {
            if (duration.current !== undefined) {
                userEvents.addEvent?.('Duration', {
                    ...sharedAnalyticsEventProperties,
                    duration: Math.floor(duration.current satisfies number),
                });
            }
        };
    }, [duration, userEvents]);

    return !requestErrorAlert && requestFundsMutation.error ? (
        <CapitalErrorMessageDisplay error={requestFundsMutation.error} onBack={onBackWithTracking} onContactSupport={onContactSupport} />
    ) : (
        <div className="adyen-pe-capital-offer-summary">
            <InfoBox className="adyen-pe-capital-offer-summary__grant-summary">
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY}>
                    <Translation
                        translationKey="capital.offer.common.fundingRequestInfo"
                        fills={{
                            amount: (
                                <strong>{`${i18n.amount(grantOffer.grantAmount.value, grantOffer.grantAmount.currency, { minimumFractionDigits: 0 })}`}</strong>
                            ),
                        }}
                    />
                </Typography>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                    {i18n.get('capital.offer.common.repaymentInfo', {
                        values: {
                            amount: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
                            days: CAPITAL_REPAYMENT_FREQUENCY,
                            date: expectedRepaymentDate ?? '',
                        },
                    })}
                </Typography>
            </InfoBox>
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
                {requestFundsMutation.error && !requestErrorAlert ? null : (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBackWithTracking}>
                        {i18n.get('capital.common.actions.goBack')}
                    </Button>
                )}
                <Button
                    variant={ButtonVariant.PRIMARY}
                    state={requestFundsMutation.isLoading ? 'loading' : undefined}
                    onClick={onRequestFundsHandler}
                    disabled={requestFundsMutation.isLoading || !!requestFundsMutation.error || !!requestFundsMutation.data}
                    aria-label={i18n.get('capital.offer.summary.actions.requestFunds')}
                >
                    {i18n.get(
                        requestFundsMutation.isLoading
                            ? 'capital.offer.summary.actions.requestFunds.states.loading'
                            : 'capital.offer.summary.actions.requestFunds'
                    )}
                </Button>
            </div>
        </div>
    );
};
