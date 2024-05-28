import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../core/Localization/types';
import { IPayoutDetails } from '../../../../types';
import Card from '../../../internal/Card/Card';
import { DATE_FORMAT } from '../../../internal/DataOverviewDisplay/constants';
import StructuredList from '../../../internal/StructuredList';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import TransactionDataSkeleton from '../../TransactionDetails/components/TransactionDataSkeleton';
import './PayoutData.scss';

export const PayoutData = ({ payout: payoutData, isFetching }: { payout?: IPayoutDetails; isFetching?: boolean }) => {
    const { payout } = payoutData ?? {};
    const { i18n } = useCoreContext();
    const { subtractions, additions } =
        payoutData?.amountBreakdown?.reduce(
            (accumulator, currentValue) => {
                const payoutValue = currentValue?.amount?.value;
                const category = currentValue?.category === 'unknown' ? 'Other' : currentValue?.category;
                const categoryLabel = category && i18n.has(`txType.${category}`) ? i18n.get(`txType.${category}` as TranslationKey) : category;
                if (payoutValue && payoutValue < 0) {
                    accumulator.subtractions = currentValue?.category
                        ? { ...accumulator.subtractions, [categoryLabel]: payoutValue }
                        : { ...accumulator.subtractions };
                } else {
                    accumulator.additions = currentValue?.category
                        ? { ...accumulator.additions, [categoryLabel]: payoutValue }
                        : { ...accumulator.additions };
                }
                return accumulator;
            },
            { subtractions: {}, additions: {} }
        ) ?? {};

    const creationDate = useMemo(() => (payout?.createdAt ? i18n.date(new Date(payout?.createdAt), DATE_FORMAT).toString() : ''), [payout, i18n]);

    return (
        <>
            {!payout ? (
                <TransactionDataSkeleton isLoading={isFetching} skeletonRowNumber={6} />
            ) : (
                <div className={'adyen-pe-payout-data'}>
                    <div className={'adyen-pe-payout-data__title'}>
                        <Typography variant={TypographyVariant.SUBTITLE} stronger>
                            {i18n.get('netPayout')}
                        </Typography>
                        <Typography variant={TypographyVariant.TITLE} large>
                            {i18n.amount(payout.netAmount.value, payout.netAmount.currency)}
                        </Typography>
                        <Typography variant={TypographyVariant.BODY}>{creationDate}</Typography>
                        <Typography variant={TypographyVariant.BODY} stronger>
                            {`${i18n.get('referenceID')}: ${payout.id}`}
                        </Typography>
                    </div>
                    <div className={'adyen-pe-payout-data__content'}>
                        <div className={'adyen-pe-payout-data__content--section'}>
                            <div className={'adyen-pe-payout-data__content--section-amount adyen-pe-payout-data__content--section-amount-gross'}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get('grossPayout')}</Typography>
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.amount(payout.grossAmount.value, payout.grossAmount.currency)}
                                </Typography>
                            </div>
                            {subtractions && Boolean(Object.keys(subtractions).length) && (
                                <div className={'adyen-pe-payout-data__content--card'}>
                                    <Card
                                        renderHeader={
                                            <Typography
                                                className={'adyen-pe-payout-data__content--card-title'}
                                                variant={TypographyVariant.CAPTION}
                                                stronger
                                            >
                                                {i18n.get('subtractions')}
                                            </Typography>
                                        }
                                    >
                                        <StructuredList items={subtractions} />
                                    </Card>
                                </div>
                            )}
                            {additions && Boolean(Object.keys(additions).length) && (
                                <div className={'adyen-pe-payout-data__content--card'}>
                                    <Card
                                        renderHeader={
                                            <Typography
                                                className={'adyen-pe-payout-data__content--card-title'}
                                                variant={TypographyVariant.CAPTION}
                                                stronger
                                            >
                                                {i18n.get('additions')}
                                            </Typography>
                                        }
                                    >
                                        <StructuredList items={additions} />
                                    </Card>
                                </div>
                            )}
                            <div className={'adyen-pe-payout-data__content--section-amount adyen-pe-payout-data__content--section-amount-net'}>
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.get('netPayout')}
                                </Typography>
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.amount(payout.netAmount.value, payout.netAmount.currency)}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
