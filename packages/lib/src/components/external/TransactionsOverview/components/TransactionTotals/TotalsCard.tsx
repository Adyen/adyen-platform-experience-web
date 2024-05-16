import { useState } from 'preact/hooks';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { memo } from 'preact/compat';
import { TransactionTotalItem } from '../TransactionTotalItem/TransactionTotalItem';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { useMaxWidthsState } from '../../hooks/useMaxWidths';
import { ITransactionTotal } from '../../../../../types';
import './TransactionTotals.scss';

type TotalsCardProps = {
    totals: ITransactionTotal[];
    hiddenField?: 'incomings' | 'expenses';
    isLoading: boolean;
    fullWidth?: boolean;
};

export const TotalsCard = memo(({ totals, isLoading, hiddenField, fullWidth }: TotalsCardProps) => {
    const [firstTotal, ...restOfTotals] = totals;
    const [maxWidths, setMaxWidths] = useMaxWidthsState();
    const [isHovered, setIsHovered] = useState(false);

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
        >
            {!isLoading && restOfTotals.length && (
                <BaseList>
                    {restOfTotals.map(total => (
                        <li key={total.currency}>
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
