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
import { useAuthContext } from '../../../../../core/Auth';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { EMPTY_OBJECT } from '../../../../../utils';
import { AdyenErrorResponse } from '../../../../../core/Http/types';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Alert from '../../../../internal/Alert/Alert';
import Icon from '../../../../internal/Icon';
import { CapitalErrorMessageDisplay } from '../utils/CapitalErrorMessageDisplay';

const errorMessageWithAlert = ['30_013'];

export const CapitalOfferSummary = ({
    grantOffer,
    repaymentFrequency,
    onBack,
    onRequestFunds,
    onContactSupport,
}: {
    grantOffer: IGrantOfferResponseDTO;
    repaymentFrequency: number;
    onBack: () => void;
    onRequestFunds?: (data: IGrant) => void;
    onContactSupport?: () => void;
}) => {
    const { i18n } = useCoreContext();
    const expectedRepaymentDate = useMemo(() => {
        const date = getExpectedRepaymentDate(grantOffer.expectedRepaymentPeriodDays);
        return date ? i18n.date(date, { month: 'long' }) : null;
    }, [grantOffer, i18n]);

    const { requestFunds } = useAuthContext().endpoints;

    const requestFundsMutation = useMutation({
        queryFn: requestFunds,
        options: {
            onSuccess: data => onRequestFunds?.(data),
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
                        message: i18n.get('capital.weCannotContinueWithTheOffer'),
                        errorCode: '30_013',
                    };
                default:
                    return {
                        title: i18n.get('capital.somethingWentWrong'),
                        message: i18n.get('capital.weCouldNotContinueWithTheOffer'),
                    };
            }
        }

        return null;
    }, [i18n, requestFundsMutation.error]);

    return !requestErrorAlert && requestFundsMutation.error ? (
        <CapitalErrorMessageDisplay error={requestFundsMutation.error} onBack={onBack} onContactSupport={onContactSupport} />
    ) : (
        <div className="adyen-pe-capital-offer-summary">
            <InfoBox className="adyen-pe-capital-offer-summary__grant-summary">
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY}>
                    {i18n.get('capital.youAreRequestingFundingOf')}{' '}
                    <strong>{`${i18n.amount(grantOffer.grantAmount.value, grantOffer.grantAmount.currency)}.`}</strong>
                </Typography>
                <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.CAPTION}>
                    {i18n.get('capital.minimumRepaymentFrequency', {
                        values: {
                            amount: i18n.amount(grantOffer.thresholdAmount.value, grantOffer.thresholdAmount.currency),
                            days: repaymentFrequency,
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
                                content={i18n.get('capital.minimumRepaymentDaysToRepayFinancing', { values: { days: repaymentFrequency } })}
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
                    if (key === 'capital.account' && requestFundsMutation.error && requestErrorAlert && requestErrorAlert.errorCode === '30_013') {
                        return (
                            <Typography
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                                stronger
                                className={'adyen-pe-capital-offer-summary__details--error'}
                            >
                                <Icon name={'warning-filled'} />
                                <span>{i18n.get('capital.primaryAccount')}</span>
                            </Typography>
                        );
                    }
                    return (
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                            {val}
                        </Typography>
                    );
                }}
                items={[
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
                        key: 'capital.repaymentRatePercentage',
                        value: `${getPaymentRatePercentage(grantOffer.repaymentRate)}% ${i18n.get('capital.daily')}`,
                    },
                    {
                        key: 'capital.expectedRepaymentPeriod',
                        value: `${grantOffer.expectedRepaymentPeriodDays} ${i18n.get('capital.days')}`,
                    },
                    {
                        key: 'capital.maximumRepaymentPeriod',
                        value: maximumRepaymentPeriod
                            ? `${calculateMaximumRepaymentPeriodInMonths(grantOffer.maximumRepaymentPeriodDays)} ${i18n.get(
                                  maximumRepaymentPeriod > 1 ? 'capital.months' : 'capital.month'
                              )}`
                            : null,
                    },
                    { key: 'capital.account', value: i18n.get('capital.primaryAccount') },
                ]}
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
                            {i18n.get('reachOutToSupport')}
                        </Button>
                    ) : null}
                </Alert>
            )}
            <div className="adyen-pe-capital-offer-summary__buttons">
                {!requestFundsMutation.error && (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                        {i18n.get('capital.back')}
                    </Button>
                )}
                <Button
                    variant={ButtonVariant.PRIMARY}
                    onClick={onRequestFundsHandler}
                    disabled={requestFundsMutation.isLoading || !!requestFundsMutation.error}
                >
                    {i18n.get('capital.requestFunds')}
                </Button>
            </div>
        </div>
    );
};
