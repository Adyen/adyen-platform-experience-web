import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../core/Localization/types';
import { IPayoutDetails } from '../../../../types';
import { components } from '../../../../types/api/resources/PayoutsResource';
import { EMPTY_OBJECT } from '../../../../utils';
import Card from '../../../internal/Card/Card';
import { DATE_FORMAT } from '../../../internal/DataOverviewDisplay/constants';
import StructuredList from '../../../internal/StructuredList';
import { ListValue } from '../../../internal/StructuredList/types';
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
    PD_UNPAID_AMOUNT,
} from './constants';

type Payout = components['schemas']['PayoutDTO'];

export const PayoutData = ({
    balanceAccountId,
    payout: payoutData,
    isFetching,
}: {
    payout?: IPayoutDetails;
    isFetching?: boolean;
    balanceAccountId: string;
}) => {
    const { payout }: { payout: Payout } = payoutData ?? EMPTY_OBJECT;
    const { i18n } = useCoreContext();
    const adjustments = useMemo(() => {
        return payoutData?.amountBreakdowns?.adjustmentBreakdown?.reduce(
            (accumulator, currentValue) => {
                const payoutValue =
                    currentValue?.amount?.value && currentValue?.amount?.currency
                        ? i18n.amount(currentValue?.amount?.value, currentValue?.amount?.currency)
                        : (currentValue?.amount?.value ?? '').toString();
                const translationKey = `${currentValue?.category}` as TranslationKey;
                const categoryTranslation = i18n.get(translationKey);
                const categoryLabel = currentValue?.category && categoryTranslation !== translationKey ? categoryTranslation : currentValue?.category;

                if (currentValue?.category && payoutValue && categoryLabel) {
                    const targetObj = accumulator[currentValue?.amount?.value && currentValue?.amount?.value < 0 ? 'subtractions' : 'additions'];
                    targetObj[categoryLabel] = payoutValue;
                }

                return accumulator;
            },
            { subtractions: {} as Record<string, string>, additions: {} as Record<string, string> }
        );
    }, [i18n, payoutData]);

    const fundsCaptured = useMemo(() => {
        return payoutData?.amountBreakdowns?.fundsCapturedBreakdown?.reduce((items, breakdown) => {
            if (breakdown?.amount?.value === 0) return items;
            items[breakdown.category as TranslationKey] = breakdown?.amount?.value;
            return items;
        }, {} as { [key in TranslationKey]?: ListValue | undefined });
    }, [payoutData]);

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
                            {i18n.amount(payout.payoutAmount.value, payout.payoutAmount.currency)}
                        </Typography>
                        <Typography variant={TypographyVariant.BODY}>{creationDate}</Typography>
                        <Typography variant={TypographyVariant.BODY} stronger>
                            {`${i18n.get('referenceID')}: ${balanceAccountId}`}
                        </Typography>
                    </div>
                    <div className={PD_CONTENT_CLASS}>
                        <div className={PD_SECTION_CLASS}>
                            <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS)}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get('fundsCaptured')}</Typography>
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.amount(payout.fundsCapturedAmount.value, payout.fundsCapturedAmount.currency)}
                                </Typography>
                            </div>
                            <div className={PD_SECTION_CLASS}>
                                {fundsCaptured && Boolean(Object.keys(fundsCaptured).length) && (
                                    <div className={PD_CARD_CLASS}>
                                        <Card>
                                            <StructuredList items={fundsCaptured} />
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={PD_SECTION_CLASS}>
                            <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS)}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get('adjustments')}</Typography>
                                <Typography variant={TypographyVariant.BODY}>
                                    {i18n.amount(payout.fundsCapturedAmount.value, payout.fundsCapturedAmount.currency)}
                                </Typography>
                            </div>
                        </div>
                        <div className={PD_SECTION_CLASS}>
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
                        </div>
                        <div className={classnames(PD_SECTION_CLASS)}>
                            <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_NET_AMOUNT_CLASS)}>
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.get('netPayout')}
                                </Typography>
                                <Typography variant={TypographyVariant.BODY} stronger>
                                    {i18n.amount(payout.payoutAmount.value, payout.payoutAmount.currency)}
                                </Typography>
                            </div>
                        </div>
                    </div>
                    {payoutData?.payout?.unpaidAmount && (
                        <div className={PD_UNPAID_AMOUNT}>
                            <Typography variant={TypographyVariant.BODY}>{i18n.get('remainingAmount')}</Typography>
                            <Typography variant={TypographyVariant.BODY}>
                                {i18n.amount(payoutData.payout.unpaidAmount.value, payoutData.payout.unpaidAmount.currency)}
                            </Typography>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
