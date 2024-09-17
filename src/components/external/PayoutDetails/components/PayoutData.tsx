import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../translations';
import { IPayoutDetails } from '../../../../types';
import { components } from '../../../../types/api/resources/PayoutsResource';
import { EMPTY_OBJECT } from '../../../../utils';
import Accordion from '../../../internal/Accordion/Accordion';
import Card from '../../../internal/Card/Card';
import { DATE_FORMAT_PAYOUTS_DETAILS } from '../../../internal/DataOverviewDisplay/constants';
import StructuredList from '../../../internal/StructuredList';
import { ListValue } from '../../../internal/StructuredList/types';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import TransactionDataSkeleton from '../../TransactionDetails/components/TransactionDataSkeleton';
import useTimezoneAwareDateFormatting from '../../../hooks/useTimezoneAwareDateFormatting';
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
    PD_TITLE_BA_CLASS,
    PD_TITLE_CLASS,
    PD_UNPAID_AMOUNT,
} from './constants';

type Payout = components['schemas']['PayoutDTO'];

export const PayoutData = ({
    balanceAccountId,
    balanceAccountDescription,
    payout: payoutData,
    isFetching,
}: {
    payout?: IPayoutDetails;
    isFetching?: boolean;
    balanceAccountId: string;
    balanceAccountDescription?: string;
}) => {
    const { payout }: { payout: Payout } = payoutData ?? EMPTY_OBJECT;
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const adjustments = useMemo(() => {
        const data = payoutData?.amountBreakdowns?.adjustmentBreakdown?.reduce(
            (accumulator, currentValue) => {
                const payoutValue =
                    currentValue?.amount?.value && currentValue?.amount?.currency
                        ? i18n.amount(currentValue?.amount?.value, currentValue?.amount?.currency, { hideCurrency: true })
                        : (currentValue?.amount?.value ?? '').toString();
                const translationKey = `${currentValue?.category}` as TranslationKey;
                const categoryTranslation = i18n.get(translationKey);
                const categoryLabel = currentValue?.category && categoryTranslation !== translationKey ? categoryTranslation : currentValue?.category;

                if (currentValue?.category && payoutValue && categoryLabel) {
                    const targetObj = accumulator[currentValue?.amount?.value && currentValue?.amount?.value < 0 ? 'subtractions' : 'additions'];
                    targetObj.push({ key: categoryLabel as TranslationKey, value: payoutValue });
                }
                return accumulator;
            },
            { subtractions: [] as { key: TranslationKey; value: ListValue }[], additions: [] as { key: TranslationKey; value: ListValue }[] }
        );
        data?.subtractions.sort((a, b) => a.key.localeCompare(b.key));
        data?.additions.sort((a, b) => a.key.localeCompare(b.key));
        return data;
    }, [i18n, payoutData]);

    const fundsCaptured = useMemo(() => {
        const data = payoutData?.amountBreakdowns?.fundsCapturedBreakdown?.reduce((items, breakdown) => {
            if (breakdown?.amount?.value === 0) return items;
            if (breakdown?.amount?.value && breakdown.category) {
                items.push({
                    key: breakdown.category as TranslationKey,
                    value: i18n.amount(breakdown?.amount?.value, breakdown?.amount?.currency, { hideCurrency: true }),
                });
            }
            return items;
        }, [] as { key: TranslationKey; value: ListValue }[]);
        data?.sort((a, b) => {
            if (a.key === 'capture') return -1;
            if (b.key === 'capture') return 1;
            return a.key.localeCompare(b.key);
        });
        return data;
    }, [payoutData, i18n]);

    const creationDate = useMemo(
        () => (payout?.createdAt ? dateFormat(new Date(payout?.createdAt), DATE_FORMAT_PAYOUTS_DETAILS) : ''),
        [payout, dateFormat]
    );

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
                            {`${i18n.amount(payout.payoutAmount.value, payout.payoutAmount.currency, {
                                hideCurrency: true,
                            })} ${payout.payoutAmount.currency}`}
                        </Typography>
                        <Typography variant={TypographyVariant.BODY}>{creationDate}</Typography>
                        <div className={PD_SECTION_CLASS}>
                            {balanceAccountDescription && (
                                <Typography variant={TypographyVariant.CAPTION} stronger wide>
                                    {`${balanceAccountDescription}`}
                                </Typography>
                            )}
                            <Typography variant={TypographyVariant.CAPTION} className={PD_TITLE_BA_CLASS}>{`${balanceAccountId}`}</Typography>
                        </div>
                    </div>
                    <div className={PD_CONTENT_CLASS}>
                        <div className={PD_SECTION_CLASS}>
                            {payout?.fundsCapturedAmount &&
                                (fundsCaptured && Object.keys(fundsCaptured).length > 0 ? (
                                    <Accordion
                                        header={<Typography variant={TypographyVariant.BODY}>{i18n.get('fundsCaptured')}</Typography>}
                                        headerInformation={
                                            <Typography variant={TypographyVariant.BODY}>
                                                {i18n.amount(payout.fundsCapturedAmount.value, payout.fundsCapturedAmount.currency)}
                                            </Typography>
                                        }
                                    >
                                        <div className={PD_SECTION_CLASS}>
                                            {
                                                <div className={PD_CARD_CLASS}>
                                                    <Card>
                                                        <StructuredList items={fundsCaptured} />
                                                    </Card>
                                                </div>
                                            }
                                        </div>
                                    </Accordion>
                                ) : (
                                    <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS)}>
                                        <Typography variant={TypographyVariant.BODY}>{i18n.get('fundsCaptured')}</Typography>
                                        <Typography variant={TypographyVariant.BODY}>
                                            {i18n.amount(payout.fundsCapturedAmount.value, payout.fundsCapturedAmount.currency)}
                                        </Typography>
                                    </div>
                                ))}
                        </div>
                        <div className={PD_SECTION_CLASS}>
                            {(adjustments?.subtractions && Object.keys(adjustments?.subtractions).length > 0) ||
                            (adjustments?.additions && Object.keys(adjustments?.additions).length > 0) ? (
                                <Accordion
                                    header={<Typography variant={TypographyVariant.BODY}>{i18n.get('adjustments')}</Typography>}
                                    headerInformation={
                                        <Typography variant={TypographyVariant.BODY}>
                                            {i18n.amount(payout.adjustmentAmount.value, payout.adjustmentAmount.currency)}
                                        </Typography>
                                    }
                                >
                                    {adjustments?.additions && Object.keys(adjustments?.additions).length > 0 && (
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
                                    {adjustments?.subtractions && Object.keys(adjustments?.subtractions).length > 0 && (
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
                                </Accordion>
                            ) : (
                                <div className={classnames(PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS)}>
                                    <Typography variant={TypographyVariant.BODY}>{i18n.get('adjustments')}</Typography>
                                    <Typography variant={TypographyVariant.BODY}>
                                        {i18n.amount(payout.adjustmentAmount.value, payout.adjustmentAmount.currency)}
                                    </Typography>
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
