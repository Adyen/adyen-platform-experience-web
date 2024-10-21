import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Card from '../../../../internal/Card/Card';
import { Tag } from '../../../../internal/Tag/Tag';
import ProgressBar from '../../../../internal/ProgressBar';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '../../../../../constants';
import { GRANT_ITEM_CLASS_NAMES } from './constants';
import { getGrantConfig } from './utils';
import { GrantItemProps } from './types';
import './GrantItem.scss';
import { ExpandableContainer } from '../../../../internal/ExpandableContainer/ExpandableContainer';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListItem } from '../../../../internal/StructuredList/types';

export const GrantItem: FunctionalComponent<GrantItemProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const grantConfig = useMemo(() => getGrantConfig(grant), [grant]);
    const formatAmount = useCallback((amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency), [i18n]);
    const structuredListItems = useMemo<StructuredListItem[]>(() => {
        const maximumRepaymentPeriodMonths = Math.ceil(grant.maximumRepaymentPeriodDays / 30);
        return [
            {
                key: 'capital.remainingAmount',
                value: i18n.amount(grant.remainingGrantAmount.value, grant.remainingGrantAmount.currency),
            },
            { key: 'capital.remainingFee', value: formatAmount(grant.remainingFeesAmount) },
            { key: 'capital.repaidAmount', value: formatAmount(grant.repaidGrantAmount) },
            { key: 'capital.repaidFees', value: formatAmount(grant.repaidFeesAmount) },
            { key: 'capital.repaymentRate', value: i18n.get('capital.percentDaily', { values: { percent: grant.repaymentRate } }) },
            {
                key: 'capital.expectedRepaymentPeriod',
                value: i18n.get('capital.daysAndDaysLeft', {
                    values: {
                        days: grant.expectedRepaymentPeriodDays,
                        daysLeft: grant.repaymentPeriodLeft,
                    },
                }),
            },
            {
                key: 'capital.maximumRepaymentPeriod',
                value: `${maximumRepaymentPeriodMonths} ${i18n.get('capital.months')}`,
            },
            { key: 'capital.totalFees', value: formatAmount(grant.feesAmount) },
            { key: 'capital.totalRepaymentAmount', value: formatAmount(grant.totalAmount) },
            { key: 'capital.repaymentThreshold', value: formatAmount(grant.thresholdAmount) },
            { key: 'capital.loadId', value: grant.id },
            { key: 'capital.balanceDescription', value: grant.balanceAccountDescription },
            { key: 'capital.balanceAccount', value: grant.balanceAccountCode },
        ];
    }, [grant, formatAmount, i18n]);

    return (
        <div className={GRANT_ITEM_CLASS_NAMES.base}>
            <Card classNameModifiers={[GRANT_ITEM_CLASS_NAMES.overview]} filled={grantConfig.isBackgroundFilled} testId={'grant-container'}>
                <div className={GRANT_ITEM_CLASS_NAMES.statusContainer}>
                    {grant.status === 'Active' ? (
                        <>
                            <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN}>
                                {i18n.get('capital.termEnds')}
                            </Typography>
                            <Typography variant={TypographyVariant.CAPTION} stronger el={TypographyElement.SPAN}>
                                {dateFormat(grantConfig.repaymentPeriodEndDate, DATE_FORMAT_CAPITAL_OVERVIEW)}
                            </Typography>
                        </>
                    ) : grantConfig.statusKey ? (
                        <Tag label={i18n.get(grantConfig.statusKey)} variant={grantConfig.statusTagVariant} />
                    ) : null}
                </div>
                <Typography
                    variant={TypographyVariant.CAPTION}
                    className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: grantConfig.isLabelColorSecondary })}
                    testId={'grant-amount-label'}
                >
                    {i18n.get(grantConfig.amountLabelKey)}
                </Typography>
                <Typography
                    variant={TypographyVariant.TITLE}
                    medium
                    className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: grantConfig.isAmountColorSecondary })}
                >
                    {i18n.amount(grantConfig.amount.value, grantConfig.amount.currency)}
                </Typography>
                {grantConfig.isProgressBarVisible && (
                    <ProgressBar
                        className={GRANT_ITEM_CLASS_NAMES.progressBar}
                        value={grant.repaidGrantAmount.value}
                        max={grant.grantAmount.value}
                        labels={{ current: i18n.get('capital.repaid'), max: i18n.get('capital.remaining') }}
                    />
                )}
            </Card>
            {grantConfig.hasDetails && (
                <ExpandableContainer className={GRANT_ITEM_CLASS_NAMES.details}>
                    <div className={GRANT_ITEM_CLASS_NAMES.detailsContent}>
                        <div className={GRANT_ITEM_CLASS_NAMES.detailsHeader}>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.SUBTITLE}>
                                {i18n.get('capital.yourInitialOfferWas')}
                            </Typography>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.SUBTITLE} strongest>
                                {i18n.amount(grant.grantAmount.value, grant.grantAmount.currency)}
                            </Typography>
                        </div>
                        <StructuredList
                            renderLabel={val => (
                                <Typography
                                    el={TypographyElement.SPAN}
                                    variant={TypographyVariant.CAPTION}
                                    className={GRANT_ITEM_CLASS_NAMES.detailsLabel}
                                >
                                    {val}
                                </Typography>
                            )}
                            renderValue={val => (
                                <Typography el={TypographyElement.SPAN} stronger variant={TypographyVariant.CAPTION}>
                                    {val}
                                </Typography>
                            )}
                            items={structuredListItems}
                        />
                    </div>
                </ExpandableContainer>
            )}
        </div>
    );
};
