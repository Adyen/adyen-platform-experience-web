import useCoreContext from '@src/core/Context/useCoreContext';
import classNames from 'classnames';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { BASE_CLASS, BODY_CLASS } from '@src/components/external/Transactions/components/BalanceItem/constants';
import './BalanceItem.scss';
import AmountSkeleton from '@src/components/external/Transactions/components/AmountSkeleton/AmountSkeleton';
import { useEffect, useRef } from 'preact/hooks';
import { BalanceItemProps } from '@src/components/external/Transactions/components/BalanceItem/types';

export const BalanceItem = ({ balance, isHeader = false, isSkeleton = false, isLoading = false, widths, onWidthsSet }: BalanceItemProps) => {
    const { i18n } = useCoreContext();
    const isSkeletonVisible = isSkeleton || !balance;
    const amountRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const refs = [amountRef, currencyRef];
        const newWidths = refs.map(ref => ref.current?.getBoundingClientRect().width ?? 0);
        onWidthsSet(newWidths);
    }, [onWidthsSet]);

    const getColumnStyle = (index: number) => ({ width: widths && widths[index] ? widths[index] : 'auto' });

    return (
        <div className={classNames(BASE_CLASS, { [BODY_CLASS]: !isHeader })}>
            <div>
                {isHeader && <Typography variant={TypographyVariant.CAPTION}>{i18n.get('accountBalance')}</Typography>}
                {isSkeletonVisible ? (
                    <AmountSkeleton isLoading={isLoading} hasMargin width="80px" />
                ) : (
                    <div ref={amountRef} style={getColumnStyle(0)}>
                        <Typography variant={TypographyVariant.TITLE}>{i18n.amount(balance.value, balance.currency)}</Typography>
                    </div>
                )}
            </div>

            {isSkeletonVisible ? (
                <AmountSkeleton isLoading={isLoading} width="40px" />
            ) : (
                <div ref={currencyRef} style={getColumnStyle(1)}>
                    <Typography variant={TypographyVariant.CAPTION}>{balance.currency}</Typography>
                </div>
            )}
        </div>
    );
};
