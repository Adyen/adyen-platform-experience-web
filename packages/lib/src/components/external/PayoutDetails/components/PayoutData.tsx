import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../core/Localization/types';
import { IPayoutDetails } from '../../../../types';
import { EMPTY_OBJECT } from '../../../../utils/common';
import Card from '../../../internal/Card/Card';
import { DATE_FORMAT } from '../../../internal/DataOverviewDisplay/constants';
import StructuredList from '../../../internal/StructuredList';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import TransactionDataSkeleton from '../../TransactionDetails/components/TransactionDataSkeleton';
import './PayoutData.scss';
import {
    PD_BASE_CLASS,
    PD_CARD_CLASS,
    PD_CARD_TITLE_CLASS,
    PD_CONTENT_CLASS,
    PD_SECTION_AMOUNT_CLASS,
    PD_SECTION_CLASS,
    PD_SECTION_GROSS_AMOUNT_CLASS,
    PD_SECTION_NET_AMOUNT_CLASS,
    PD_TITLE_CLASS,
} from './constants';

export const PayoutData = ({ payout: payoutData, isFetching }: { payout?: IPayoutDetails; isFetching?: boolean }) => {
    const { payout } = payoutData ?? EMPTY_OBJECT;
    const { i18n } = useCoreContext();
    const adjustments = useMemo(() => {
        return payoutData?.amountBreakdown?.reduce(
            (accumulator, currentValue) => {
                const payoutValue = currentValue?.amount?.value;
                const category = currentValue?.category === 'unknown' ? 'Other' : currentValue?.category;
                const translationKey = `txType.${category}`;
                const translatedCategory = i18n.get(translationKey as TranslationKey);
                const categoryLabel = category && translatedCategory !== translationKey ? translatedCategory : category;
                if (currentValue?.category && payoutValue) {
                    const targetObj = accumulator[payoutValue < 0 ? 'subtractions' : 'additions'];
                    targetObj[categoryLabel] = payoutValue;
                }
                return accumulator;
            },
            { subtractions: {} as Record<string, number>, additions: {} as Record<string, number> }
        );
    }, [i18n, payoutData]);

    const creationDate = useMemo(() => (payout?.createdAt ? i18n.date(new Date(payout?.createdAt), DATE_FORMAT).toString() : ''), [payout, i18n]);

    return (
        <>
            {!payout ? (
                <TransactionDataSkeleton isLoading={isFetching} skeletonRowNumber={6} />
            ) : (
                <div className={PD_BASE_CLASS}>
                    <div className={PD_TITLE_CLASS}>
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
                    <div className={PD_CONTENT_CLASS}>
                        <div className={PD_SECTION_CLASS}>
                            <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS)}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get('grossPayout')}</Typography>
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.amount(payout.grossAmount.value, payout.grossAmount.currency)}
                                </Typography>
                            </div>
                            {adjustments?.subtractions && Boolean(Object.keys(adjustments?.subtractions).length) && (
                                <div className={PD_CARD_CLASS}>
                                    <Card
                                        renderHeader={
                                            <Typography className={PD_CARD_TITLE_CLASS} variant={TypographyVariant.CAPTION} stronger>
                                                {i18n.get('subtractions')}
                                            </Typography>
                                        }
                                    >
                                        <StructuredList items={adjustments?.subtractions} />
                                    </Card>
                                </div>
                            )}
                            {adjustments?.additions && Boolean(Object.keys(adjustments?.additions).length) && (
                                <div className={PD_CARD_CLASS}>
                                    <Card
                                        renderHeader={
                                            <Typography className={PD_CARD_TITLE_CLASS} variant={TypographyVariant.CAPTION} stronger>
                                                {i18n.get('additions')}
                                            </Typography>
                                        }
                                    >
                                        <StructuredList items={adjustments?.additions} />
                                    </Card>
                                </div>
                            )}
                            <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_NET_AMOUNT_CLASS)}>
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
