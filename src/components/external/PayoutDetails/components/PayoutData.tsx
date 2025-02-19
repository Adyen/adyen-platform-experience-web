import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../translations';
import { IPayoutDetails } from '../../../../types';
import { EMPTY_OBJECT } from '../../../../utils';
import Accordion from '../../../internal/Accordion/Accordion';
import Card from '../../../internal/Card/Card';
import { DATE_FORMAT_PAYOUT_DETAILS } from '../../../../constants';
import StructuredList from '../../../internal/StructuredList';
import { ListValue, StructuredListProps } from '../../../internal/StructuredList/types';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import DataOverviewDetailsSkeleton from '../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import './PayoutData.scss';
import {
    PD_BASE_CLASS,
    PD_BUTTON_ACTIONS,
    PD_CARD_CLASS,
    PD_CARD_TITLE_CLASS,
    PD_CONTENT_CLASS,
    PD_EXTRA_DETAILS_CLASS,
    PD_EXTRA_DETAILS_ICON,
    PD_EXTRA_DETAILS_LABEL,
    PD_SECTION_AMOUNT_CLASS,
    PD_SECTION_CLASS,
    PD_SECTION_GROSS_AMOUNT_CLASS,
    PD_SECTION_NET_AMOUNT_CLASS,
    PD_TITLE_BA_CLASS,
    PD_TITLE_CLASS,
    PD_TITLE_CLASS_WITH_EXTRA_DETAILS,
    PD_UNPAID_AMOUNT,
} from './constants';
import Link from '../../../internal/Link/Link';
import Icon from '../../../internal/DataGrid/components/Icon';
import { _isCustomDataObject } from '../../../internal/DataGrid/components/TableCells';
import cx from 'classnames';
import { ButtonVariant } from '../../../internal/Button/types';
import { ButtonActionsLayoutBasic } from '../../../internal/Button/ButtonActions/types';
import ButtonActions from '../../../internal/Button/ButtonActions/ButtonActions';

export const PayoutData = ({
    balanceAccountId,
    balanceAccountDescription,
    payout: payoutData,
    extraFields,
}: {
    payout?: IPayoutDetails;
    isFetching?: boolean;
    balanceAccountId: string;
    balanceAccountDescription?: string;
    extraFields?: Record<string, any> | undefined;
}) => {
    const { payout } = payoutData ?? (EMPTY_OBJECT as NonNullable<typeof payoutData>);
    const { dateFormat } = useTimezoneAwareDateFormatting('UTC');
    const { i18n } = useCoreContext();

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
        () => (payout?.createdAt ? dateFormat(new Date(payout?.createdAt), DATE_FORMAT_PAYOUT_DETAILS) : ''),
        [payout, dateFormat]
    );

    const extraDetails: StructuredListProps['items'] =
        Object.entries(extraFields || {})
            .filter(([, value]) => _isCustomDataObject(value) && value.type !== 'button')
            .map(([key, value]) => ({
                key: key as TranslationKey,
                value: _isCustomDataObject(value) ? value.value : value,
                type: _isCustomDataObject(value) ? value.type : 'text',
                details: _isCustomDataObject(value) ? value.details : undefined,
            })) || [];

    const buttonActions = useMemo(() => {
        const extraActions = extraFields
            ? Object.values(extraFields)
                  .filter(field => field.type === 'button')
                  .map(action => ({ title: action.value, variant: ButtonVariant.SECONDARY, event: action.details.action }))
            : [];
        const actions = [...extraActions].filter(Boolean);
        return actions;
    }, [extraFields]);

    return (
        <>
            {!payout ? (
                <DataOverviewDetailsSkeleton skeletonRowNumber={6} />
            ) : (
                <div className={PD_BASE_CLASS}>
                    <div
                        className={cx(PD_TITLE_CLASS, {
                            [PD_TITLE_CLASS_WITH_EXTRA_DETAILS]: extraDetails.length,
                        })}
                    >
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
                    <div>
                        <StructuredList
                            classNames={PD_EXTRA_DETAILS_CLASS}
                            items={extraDetails}
                            layout="5-7"
                            renderLabel={label => <div className={PD_EXTRA_DETAILS_LABEL}>{label}</div>}
                            renderValue={(val, key, type, details) => {
                                if (type === 'link') {
                                    return (
                                        <Link href={details.href} target={details.target || '_blank'}>
                                            {val}
                                        </Link>
                                    );
                                }
                                if (type === 'icon') {
                                    const icon = { url: details.src, alt: details.alt || val };
                                    return (
                                        <div className={PD_EXTRA_DETAILS_ICON}>
                                            <Icon {...icon} />
                                            <Typography variant={TypographyVariant.BODY}> {val} </Typography>
                                        </div>
                                    );
                                }
                                return <Typography variant={TypographyVariant.BODY}> {val} </Typography>;
                            }}
                        />
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
                                                    <Card noPadding>
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
                                                noPadding
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
                                                noPadding
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
                    {buttonActions.length && (
                        <div className={PD_BUTTON_ACTIONS}>
                            <ButtonActions actions={buttonActions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
