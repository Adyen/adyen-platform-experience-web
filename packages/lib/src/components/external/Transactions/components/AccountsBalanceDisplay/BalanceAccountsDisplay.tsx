import { useSetupEndpoint } from '@src/hooks/useSetupEndpoint/useSetupEndpoint';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { EMPTY_OBJECT } from '@src/utils/common';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { OperationParameters } from '@src/types/models/openapi/endpoints';
import { MakeFieldValueUndefined } from '@src/utils/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import './BalanceAccountsDisplay.scss';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { memo } from 'preact/compat';
import cx from 'classnames';

type TransactionTotalsProps = Required<OperationParameters<'getBalances'>['path']>;

export const BalanceAccountsDisplay = memo(
    ({
        balanceAccountId,
        updateBalanceAccountCurrencies,
    }: MakeFieldValueUndefined<TransactionTotalsProps, 'balanceAccountId'> & {
        updateBalanceAccountCurrencies: (currencies?: readonly string[]) => any;
    }) => {
        const { i18n } = useCoreContext();
        const getAccountsBalance = useSetupEndpoint('getBalances');

        const fetchCallback = useCallback(async () => {
            return getAccountsBalance(EMPTY_OBJECT, {
                path: { balanceAccountId: balanceAccountId! },
            });
        }, [balanceAccountId, getAccountsBalance]);

        const { data, error, isFetching } = useFetch({
            fetchOptions: useMemo(() => ({ enabled: !!balanceAccountId }), [balanceAccountId]),
            queryFn: fetchCallback,
        });

        useEffect(() => {
            if (!error && data?.balances?.length) {
                updateBalanceAccountCurrencies(Object.freeze(data?.balances!.map(({ currency }) => currency).sort()));
            }
        }, [data, error, updateBalanceAccountCurrencies]);

        const totals = data?.balances[0];

        const isLoading = !balanceAccountId || isFetching;

        const showSkeleton = isLoading || error || data?.balances?.length === 0;

        return (
            <div className="adyen-fp-account-balance">
                <div className="adyen-fp-account-balance__amount">
                    <Typography variant={TypographyVariant.CAPTION}>{i18n.get('accountBalance')}</Typography>

                    {showSkeleton ? (
                        <span
                            className={cx('adyen-fp-account-balance__skeleton', { 'adyen-fp-account-balance__skeleton--loading': isLoading })}
                        ></span>
                    ) : (
                        totals && <Typography variant={TypographyVariant.TITLE}>{i18n.amount(totals.value, totals.currency)}</Typography>
                    )}
                </div>

                <span>{totals?.currency}</span>
            </div>
        );
    }
);
