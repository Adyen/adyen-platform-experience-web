import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../core/Localization/types';

//TODO: Put all of the class names to constant folder
//TODO: Add styles
//TODO: Add Card component
//TODO: Check if the conditional data exists
import { IPayoutDetails } from '../../../../types';
import Card from '../../../internal/Card/Card';
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
                if (payoutValue && payoutValue < 0 && currentValue?.category) {
                    accumulator.subtractions = currentValue?.category
                        ? { ...accumulator.subtractions, [currentValue?.category]: currentValue?.amount?.value }
                        : { ...accumulator.subtractions };
                } else {
                    accumulator.additions = currentValue?.category
                        ? { ...accumulator.additions, [currentValue?.category]: currentValue?.amount?.value }
                        : { ...accumulator.additions };
                }
                return accumulator;
            },
            { subtractions: {}, additions: {} }
        ) ?? {};

    console.log(subtractions);
    console.log(additions);

    //TODO: make this a helper method to share it
    const creationDate = useMemo(
        () =>
            payout?.createdAt
                ? i18n
                      .date(new Date(payout?.createdAt), {
                          weekday: 'long',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'shortOffset',
                      })
                      .toString()
                : '',
        [payout, i18n]
    );

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
                            <div className={'adyen-pe-payout-data__content--section-amount'}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get('grossPayout')}</Typography>
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.amount(payout.grossAmount.value, payout.grossAmount.currency)}
                                </Typography>
                            </div>
                            {subtractions && Boolean(Object.keys(subtractions).length) && (
                                <div className={'adyen-pe-payout-data__content--card'}>
                                    <Card title={i18n.get('subtractions')}>
                                        <StructuredList items={subtractions} />
                                        {/*{subtractions.map((subtraction, index) => (*/}
                                        {/*    <div className={'adyen-pe-payout-data__content--card-row'} key={`subtraction-${index}`}>*/}
                                        {/*        {subtraction?.category && i18n.get(subtraction.category as TranslationKey)}*/}
                                        {/*        {subtraction?.amount?.value && subtraction.amount.value}*/}
                                        {/*    </div>*/}
                                        {/*))}*/}
                                    </Card>
                                </div>
                            )}
                            {additions && Boolean(Object.keys(additions).length) && (
                                <div className={'adyen-pe-payout-data__content--card'}>
                                    <Card title={i18n.get('additions')}>
                                        <StructuredList items={additions} layout={'3-9'} />
                                        {/*<>*/}
                                        {/*    {additions.map((addition, index) => (*/}
                                        {/*        <div className={'adyen-pe-payout-data__content--card-row'} key={`addition-${index}`}>*/}
                                        {/*            {addition?.category && i18n.get(addition.category as TranslationKey)}*/}
                                        {/*            {addition?.amount?.value && addition.amount.value}*/}
                                        {/*        </div>*/}
                                        {/*    ))}*/}
                                        {/*</>*/}
                                    </Card>
                                </div>
                            )}
                            <div className={'adyen-pe-payout-data__content--section-amount'}>
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
