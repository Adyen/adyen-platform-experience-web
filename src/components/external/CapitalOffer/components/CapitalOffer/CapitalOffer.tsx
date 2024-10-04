import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { ExternalUIComponentProps } from '../../../../types';
import { CapitalOfferProps } from '../../types';
import { CAPITAL_OFFER_CLASS_NAMES } from './constants';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import Slider from '../../../../internal/Slider';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useAuthContext } from '../../../../../core/Auth';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import InfoBox from '../../../../internal/InfoBox';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { useEffect } from 'preact/compat';
import './CapitalOffer.scss';
import { DAY_MS } from '../../../../internal/Calendar/calendar/constants';
import { parseDate } from '../../../../../utils';
import StructuredList from '../../../../internal/StructuredList';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';

const dateStartUTCTimestampOffset = (date: Date | number | string, numberOfDays = 0) => {
    return new Date(new Date(date).setUTCHours(0, 0, 0, 0) + Math.floor(numberOfDays) * DAY_MS);
};

const REPAYMENT_FREQUENCY = 30;

type CapitalOfferState = 'OfferSelection' | 'OfferSummary';

export const CapitalOffer: FunctionalComponent<ExternalUIComponentProps<CapitalOfferProps>> = ({ hideTitle, dynamicOffersConfig }) => {
    const [state] = useState<CapitalOfferState>('OfferSelection');

    const { i18n } = useCoreContext();
    const config = dynamicOffersConfig;
    const currency = useMemo(() => config?.minAmount.currency, [config?.minAmount.currency]);
    const [requestedValue, setRequestedValue] = useState<number | undefined>(config?.minAmount.value);

    const { reviewGrantOffer, getDynamicGrantOffer } = useAuthContext().endpoints;

    const { mutate, data, isLoading } = useMutation({
        queryFn: getDynamicGrantOffer,
    });

    const expectedRepaymentDate = useMemo(() => {
        const date = data && parseDate(dateStartUTCTimestampOffset(new Date(), data.expectedRepaymentPeriodDays));
        if (date) return i18n.date(date, { month: 'long' });
        return null;
    }, [data, i18n]);

    const getOffer = useCallback((amount: number) => mutate({}, { query: { amount, currency: currency! } }), [currency, mutate]);
    const handleSliderRelease = (event: Event) => getOffer((event.target as any).value);

    useEffect(() => {
        if (dynamicOffersConfig) {
            void getOffer(dynamicOffersConfig.minAmount.value);
        }
    }, [dynamicOffersConfig, getOffer]);

    return (
        <div className={CAPITAL_OFFER_CLASS_NAMES.base}>
            <CapitalHeader
                hideTitle={hideTitle}
                titleKey={state === 'OfferSummary' ? 'capital.businessFinancingSummary' : 'capital.businessFinancing'}
            />
            <div>
                {/* TODO: replace this with Capital Slider component */}
                <p>{'How much money do you need?'}</p>
                {requestedValue && config && <p>{i18n.amount(requestedValue, config.minAmount.currency)}</p>}
                <div>
                    {config && (
                        <Slider
                            min={config.minAmount.value}
                            max={config.maxAmount.value}
                            step={config.step}
                            value={requestedValue}
                            onMouseUp={handleSliderRelease}
                            onTouchEnd={handleSliderRelease}
                            onKeyUp={handleSliderRelease}
                            onChange={event => {
                                setRequestedValue((event.target as any).value);
                            }}
                        />
                    )}
                </div>
                <InfoBox className="adyen-pe-capital-offer__details">
                    {isLoading ? (
                        <div className="adyen-pe-capital-offer__loading-container">
                            <div className="adyen-pe-capital-offer__loading-skeleton"></div>
                            <div className="adyen-pe-capital-offer__loading-skeleton"></div>
                            <div className="adyen-pe-capital-offer__loading-skeleton"></div>
                            <div className="adyen-pe-capital-offer__loading-skeleton"></div>
                        </div>
                    ) : data ? (
                        <div className="adyen-pe-capital-offer__information">
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {i18n.get('yourMinimumRepaymentWillBe')}{' '}
                                <Typography variant={TypographyVariant.BODY} el={TypographyElement.SPAN} strongest>
                                    {`${i18n.amount(data.thresholdAmount.value, data.thresholdAmount.currency)} ${i18n.get(
                                        'every'
                                    )} ${REPAYMENT_FREQUENCY} ${i18n.get('capital.repaymentDays')}`}
                                </Typography>{' '}
                                {i18n.get('until')} {expectedRepaymentDate}
                            </Typography>
                            <StructuredList
                                renderValue={val => (
                                    <Typography el={TypographyElement.SPAN} stronger variant={TypographyVariant.CAPTION}>
                                        {val}
                                    </Typography>
                                )}
                                renderLabel={val => (
                                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                        {val}
                                    </Typography>
                                )}
                                items={[
                                    { key: 'capital.fees', value: i18n.amount(data.feesAmount.value, data.feesAmount.currency) },
                                    { key: 'capital.repaymentRate', value: `${data.repaymentRate}% ${i18n.get('capital.daily')}` },
                                    { key: 'capital.expectedRepaymentPeriod', value: data.expectedRepaymentPeriodDays },
                                ]}
                            />
                        </div>
                    ) : null}
                </InfoBox>
                <div className="adyen-pe-capital-offer__buttons">
                    <Button variant={ButtonVariant.SECONDARY} onClick={() => console.log('back')}>
                        {i18n.get('capital.back')}
                    </Button>
                    <Button variant={ButtonVariant.PRIMARY} onClick={() => console.log('back')}>
                        {i18n.get('capital.reviewOffer')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
