import { useMemo, useState } from 'preact/hooks';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { memo } from 'preact/compat';
import { TransactionTotalItem } from '../TransactionTotalItem/TransactionTotalItem';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import './TransactionTotals.scss';
import { ITransactionTotalWithKey, TotalsCardProps } from './types';

export const TotalsCard = memo(({ totals, isLoading, hiddenField, fullWidth, ...ariaAttributes }: TotalsCardProps) => {
    const [maxWidths, setMaxWidths] = useMaxWidthsState();
    const [isHovered, setIsHovered] = useState(false);

    const [firstTotal, ...restOfTotals] = useMemo(() => {
        return totals.map((t: Partial<ITransactionTotalWithKey>) => {
            t['key'] = `${t.currency}-${Math.random()}`;
            return t as ITransactionTotalWithKey;
        });
    }, [totals]);

    return (
        <ExpandableCard
            renderHeader={
                <TransactionTotalItem
                    isHovered={isHovered}
                    total={firstTotal}
                    hiddenField={hiddenField}
                    widths={maxWidths}
                    isHeader
                    isSkeleton={isLoading}
                    isLoading={isLoading}
                    onWidthsSet={setMaxWidths}
                />
            }
            fullWidth={fullWidth}
            onMouseEnter={() => setIsHovered(true)}
            onFocus={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onBlur={() => setIsHovered(false)}
            {...ariaAttributes}
        >
            {!isLoading && restOfTotals.length && (
                <BaseList>
                    {restOfTotals.map(total => (
                        <li key={total.key}>
                            <TransactionTotalItem
                                isHovered={isHovered}
                                total={total}
                                hiddenField={hiddenField}
                                widths={maxWidths}
                                onWidthsSet={setMaxWidths}
                            />
                        </li>
                    ))}
                </BaseList>
            )}
        </ExpandableCard>
    );
});
