import AmountSkeleton from '@src/components/external/Transactions/components/AmountSkeleton/AmountSkeleton';
import { BASE_CLASS, BODY_CLASS } from '@src/components/external/Transactions/components/TransactionTotalItem/constants';
import { AmountColumnConfig, TransactionTotalItemProps } from '@src/components/external/Transactions/components/TransactionTotalItem/types';
import Popover from '@src/components/internal/Popover/Popover';
import { PopoverContainerVariant } from '@src/components/internal/Popover/types';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useCoreContext from '@src/core/Context/useCoreContext';
import { TranslationKey } from '@src/core/Localization/types';
import classNames from 'classnames';
import { Ref } from 'preact';
import { MutableRef, useEffect, useRef, useState } from 'preact/hooks';
import './TransactionTotalItem.scss';
import { SummaryItemColumnConfig } from '@src/components/external/Transactions/components/SummaryItem/types';
import { TransactionTotalItemProps } from '@src/components/external/Transactions/components/TransactionTotalItem/types';
import { useRef } from 'preact/hooks';
import { SummaryItem } from '@src/components/external/Transactions/components/SummaryItem/SummaryItem';

export const TransactionTotalItem = ({
    total,
    isHeader = false,
    isSkeleton = false,
    isLoading = false,
    widths,
    onWidthsSet,
}: TransactionTotalItemProps) => {
    const { i18n } = useCoreContext();
    const incomingRef = useRef<HTMLDivElement>(null);
    const expenseRef = useRef<HTMLDivElement>(null);
    const currencyRef = useRef<HTMLDivElement>(null);
    const expenseTitleRef = useRef<HTMLSpanElement>(null);
    const incomingTitleRef = useRef<HTMLSpanElement>(null);
    const [showTooltip, setShowTooltip] = useState<TranslationKey | null>(null);
    const [currentTargetRef, setCurrentTargetRef] = useState<null | Ref<HTMLSpanElement>>(null);

    const columnConfigs: SummaryItemColumnConfig[] = [
        {
            labelKey: 'incoming',
            ref: incomingRef,
            skeletonWidth: 80,
            getValue: () => total && i18n.amount(total.incomings, total.currency),
            titleRef: incomingTitleRef,
        },
        {
            labelKey: 'expense',
            ref: expenseRef,
            skeletonWidth: 80,
            getValue: () => total && i18n.amount(total.expenses, total.currency),
            titleRef: expenseTitleRef,
        },
        {
            ref: currencyRef,
            skeletonWidth: 40,
            valueHasLabelStyle: true,
            getValue: () => total?.currency,
        },
    ];

    return (
        <SummaryItem
            isEmpty={!total}
            columnConfigs={columnConfigs}
            isHeader={isHeader}
            isSkeletonVisible={isSkeleton}
            isLoading={isLoading}
            widths={widths}
            onWidthsSet={onWidthsSet}
        />
    );
};
