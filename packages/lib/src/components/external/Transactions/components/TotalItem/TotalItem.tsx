import useCoreContext from '@src/core/Context/useCoreContext';
import classNames from 'classnames';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { BASE_CLASS, BODY_CLASS } from '@src/components/external/Transactions/components/TotalItem/constants';
import './TotalItem.scss';
import AmountSkeleton from '@src/components/external/Transactions/components/TransactionTotals/AmountSkeleton';
import { useEffect, useRef } from 'preact/hooks';
import { ColumnConfig, TotalItemProps } from '@src/components/external/Transactions/components/TotalItem/types';

export const TotalItem = ({ total, isHeader = false, isSkeleton = false, isLoading = false, widths, onWidthsSet }: TotalItemProps) => {
    const { i18n } = useCoreContext();
    const isSkeletonVisible = isSkeleton || !total;
    const incomingRef = useRef<HTMLDivElement>(null);
    const expenseRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (incomingRef.current?.getBoundingClientRect().width && expenseRef.current?.getBoundingClientRect().width) {
            onWidthsSet([incomingRef.current.getBoundingClientRect().width, expenseRef.current.getBoundingClientRect().width]);
        }
    }, [onWidthsSet]);

    const columnConfigs: ColumnConfig[] = [
        {
            labelKey: 'incoming',
            amountKey: 'incomings',
            ref: incomingRef,
        },
        {
            labelKey: 'expense',
            amountKey: 'expenses',
            ref: expenseRef,
        },
    ];

    const getColumnStyle = (index: number) => ({ width: widths && widths[index] ? widths[index] : 'auto' });

    return (
        <div className={classNames(BASE_CLASS, { [BODY_CLASS]: !isHeader })}>
            {columnConfigs.map((config, index) => (
                <div key={config.labelKey}>
                    {isHeader && <Typography variant={TypographyVariant.CAPTION}>{i18n.get(config.labelKey)}</Typography>}
                    {isSkeletonVisible ? (
                        <AmountSkeleton isLoading={isLoading} />
                    ) : (
                        <div ref={config.ref} style={getColumnStyle(index)}>
                            <Typography variant={TypographyVariant.TITLE}>{i18n.amount(total[config.amountKey], total.currency)}</Typography>
                        </div>
                    )}
                </div>
            ))}

            {isSkeletonVisible ? <AmountSkeleton isLoading={isLoading} /> : <span>{total.currency}</span>}
        </div>
    );
};
