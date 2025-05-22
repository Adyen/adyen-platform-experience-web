import InfoBox from '../../../../internal/InfoBox';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IGrant, IGrantOfferResponseDTO } from '../../../../../types';
import { useCallback, useMemo } from 'preact/hooks';
import { calculateMaximumRepaymentPeriodInMonths, getExpectedRepaymentDate, getPaymentRatePercentage } from '../utils/utils';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import StructuredList from '../../../../internal/StructuredList';
import './CapitalOfferSummary.scss';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { EMPTY_OBJECT } from '../../../../../utils';
import { AdyenErrorResponse } from '../../../../../core/Http/types';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Alert from '../../../../internal/Alert/Alert';
import Icon from '../../../../internal/Icon';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';
import cx from 'classnames';
import { StructuredListItem } from '../../../../internal/StructuredList/types';
import { CAPITAL_REPAYMENT_FREQUENCY } from '../../../../constants';
import { CapitalOfferLegalNotice } from '../CapitalOfferLegalNotice/CapitalOfferLegalNotice';

const errorMessageWithAlert = ['30_013'];

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
        grantOffer.id && requestFundsCallback(grantOffer.id);
    }, [grantOffer.id, requestFundsCallback]);

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
                        title: i18n.get('capital.thereIsNoPrimaryAccountConfigured'),
                        message: i18n.get('capital.weCouldNotContinueWithTheOfferContactSupportForHelp'),
                        errorCode: '30_013',
                    };
                default:
                    return {
                        title: i18n.get('somethingWentWrong'),
                        message: i18n.get('capital.weCouldNotLoadFinancialOffers'),
                    };
            }
        }

        return null;
    }, [i18n, requestFundsMutation.error]);

    const structuredListItems = useMemo(() => {
        const summaryItems: StructuredListItem[] = [
            {
                key: 'capital.fees',
                value: i18n.amount(grantOffer.feesAmount.value, grantOffer.feesAmount.currency),
            },
            {
                key: 'capital.totalRepaymentAmount',
                value: i18n.amount(grantOffer.totalAmount.value, grantOffer.totalAmount.currency),
            },
            {
                key: 'capital.repaymentThreshold',
                value: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
            },
            {
                key: 'capital.dailyRepaymentRate',
                value: i18n.get('capital.xPercent', { values: { percentage: getPaymentRatePercentage(grantOffer.repaymentRate) } }),
            },
            {
                key: 'capital.expectedRepaymentPeriod',
                value: i18n.get('capital.xDays', { values: { days: grantOffer.expectedRepaymentPeriodDays } }),
            },
            { key: 'account', value: i18n.get('capital.primaryAccount') },
        ];

        if (maximumRepaymentPeriod) {
            summaryItems.splice(4, 0, {
                key: 'capital.maximumRepaymentPeriod',
                value:
                    maximumRepaymentPeriod === 1
                        ? i18n.get('capital.oneMonth')
                        : i18n.get('capital.xMonths', { values: { months: maximumRepaymentPeriod } }),
            });
        }

        if (grantOffer.aprBasisPoints) {
            summaryItems.splice(1, 0, {
                key: 'capital.annualPercentageRate',
                value: i18n.get('capital.xPercent', { values: { percentage: getPaymentRatePercentage(grantOffer.aprBasisPoints) } }),
            });
        }

        return summaryItems;
    }, [grantOffer, i18n, maximumRepaymentPeriod]);

    return !requestErrorAlert && requestFundsMutation.error ? (
        <CapitalErrorMessageDisplay error={requestFundsMutation.error} onBack={onBack} onContactSupport={onContactSupport} />
    ) : (
        <div className="adyen-pe-capital-offer-summary">
            <InfoBox className="adyen-pe-capital-offer-summary__grant-summary">
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY}>
                    {i18n.get('capital.youAreRequestingFundingOf')}{' '}
                    <strong>{`${i18n.amount(grantOffer.grantAmount.value, grantOffer.grantAmount.currency, { minimumFractionDigits: 0 })}.`}</strong>
                </Typography>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                    {i18n.get('capital.youWillNeedToRepayAMinimumOfXEveryXDaysToPayOffTheFunds', {
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
                    if (key === 'capital.repaymentThreshold') {
                        return (
                            <Tooltip
                                isContainerHovered
                                content={i18n.get('capital.minimumRepaymentToRepayTheFinancingOnTime', {
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
                        key === 'account' && requestFundsMutation.error && requestErrorAlert && requestErrorAlert.errorCode === '30_013';

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
                            {i18n.get('contactSupport')}
                        </Button>
                    ) : null}
                </Alert>
            )}
            <CapitalOfferLegalNotice />
            <div className="adyen-pe-capital-offer-summary__buttons">
                {requestFundsMutation.error && !requestErrorAlert ? null : (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                        {i18n.get('back')}
                    </Button>
                )}
                <Button
                    variant={ButtonVariant.PRIMARY}
                    state={requestFundsMutation.isLoading ? 'loading' : undefined}
                    onClick={onRequestFundsHandler}
                    disabled={requestFundsMutation.isLoading || !!requestFundsMutation.error || !!requestFundsMutation.data}
                >
                    {i18n.get(requestFundsMutation.isLoading ? 'capital.requesting' : 'capital.requestFunds')}
                </Button>
            </div>
        </div>
    );
};
