import cx from 'classnames';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { classes } from './constants';
import { TranslationKey } from '../../../../../translations';
import { ITransactionCategory } from '../../../../../types';
import { getTransactionCategory } from '../../../../utils/translation/getters';
import { StructuredListItem } from '../../../../internal/StructuredList/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import AmountDisplay, { AmountDisplayProps } from '../AmountDisplay/AmountDisplay';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';
import Typography from '../../../../internal/Typography/Typography';
import StructuredList from '../../../../internal/StructuredList';
import './InsightsTotals.scss';

interface InsightsTotalsProps {
    currency?: string;
    currenciesLookupResult: ReturnType<typeof useCurrenciesLookup>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}

const InsightsTotals = ({ currency, currenciesLookupResult, transactionsTotalsResult }: InsightsTotalsProps) => {
    const { i18n } = useCoreContext();
    const { currenciesDictionary } = currenciesLookupResult;

    const data = (currency && currenciesDictionary[currency]?.totals) || undefined;

    if (transactionsTotalsResult.isWaiting || !data) {
        const breakdownArray = Array.from({ length: 2 });
        const breakdownListArray = Array.from({ length: 3 });
        const className = cx(classes.skeleton, classes.skeletonLoading);

        return (
            <div className={classes.root}>
                <span className={cx(className, classes.skeletonAmount, classes.skeletonAmountLarge)} />

                <div className={classes.breakdowns}>
                    {breakdownArray.map((_, index) => (
                        <div className={classes.breakdown} key={`breakdown-${index}`}>
                            <span className={cx(className, classes.skeletonAmount)} />

                            <div className={classes.breakdownList}>
                                {breakdownListArray.map((_, index) => (
                                    <span className={className} key={`breakdown-${index}`} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            {transactionsTotalsResult.error ? (
                <div className={classes.errorContainer}>
                    <ErrorMessageDisplay
                        title={'common.errors.somethingWentWrong'}
                        message={['common.errors.retry']}
                        absolutePosition={false}
                        outlined={false}
                        withImage
                        refreshComponent
                        onRefreshComponent={transactionsTotalsResult.refresh}
                    />
                </div>
            ) : (
                <>
                    <AmountDisplay
                        amount={data.total}
                        currency={data.currency}
                        label={i18n.get('transactions.overview.totals.tags.periodResult')}
                        large
                    />

                    <div className={classes.breakdowns}>
                        <InsightsTotalsBreakdown
                            amount={data.incomings}
                            breakdown={data.breakdown.incomings}
                            currency={data.currency}
                            label={i18n.get('transactions.overview.totals.tags.incoming')}
                        />
                        <InsightsTotalsBreakdown
                            amount={data.expenses}
                            breakdown={data.breakdown.expenses}
                            currency={data.currency}
                            label={i18n.get('transactions.overview.totals.tags.outgoing')}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

interface BreakdownProps extends AmountDisplayProps {
    ariaLabel?: string;
    breakdown: readonly { category: ITransactionCategory; value: number }[];
}

const InsightsTotalsBreakdown = ({ ariaLabel, breakdown, ...amountDisplayProps }: BreakdownProps) => {
    const { currency } = amountDisplayProps;
    const { i18n } = useCoreContext();

    const listItems = useMemo(
        () =>
            breakdown.map(
                ({ category, value }): StructuredListItem => ({
                    key: getTransactionCategory(i18n, category) as TranslationKey,
                    value: `${i18n.amount(value, currency)} ${currency}`,
                })
            ),
        [i18n, breakdown, currency]
    );

    return (
        <div className={classes.breakdown}>
            <AmountDisplay {...amountDisplayProps} />
            <StructuredList
                items={listItems}
                aria-label={ariaLabel}
                classNames={classes.breakdownList}
                renderLabel={label => (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                        {label}
                    </Typography>
                )}
                renderValue={value => (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                        {value}
                    </Typography>
                )}
            />
        </div>
    );
};

export default memo(InsightsTotals);
