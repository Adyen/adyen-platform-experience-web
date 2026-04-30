import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { uniqueId } from '@integration-components/utils';
import { TransactionDetails } from '../../types';
import { TX_TIMELINE_LABEL, TX_TIMELINE_VALUE } from '../../constants';
import { getTransactionTimelineTxStatus, getTransactionTimelineTxType } from '@integration-components/transactions/domain';
import { StructuredListItem, StructuredListProps } from '@integration-components/ui-primitives-preact/StructuredList/types';
import { TimelineDateFormat, TimelineTimestamp } from '@integration-components/ui-primitives-preact/Timeline/types';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-primitives-preact/Typography/types';
import { TimelineItem } from '@integration-components/ui-primitives-preact/Timeline/components/TimelineItem';
import { useCoreContext } from '@integration-components/core/preact';
import Typography from '@integration-components/ui-primitives-preact/Typography/Typography';
import StructuredList from '@integration-components/ui-primitives-preact/StructuredList';
import Timeline from '@integration-components/ui-primitives-preact/Timeline/Timeline';

export interface PaymentDetailsTimelineProps {
    transaction: TransactionDetails;
}

interface PaymentDetailsTimelineItemProps {
    event: NonNullable<TransactionDetails['events']>[number];
    defaultTimestamp: TimelineTimestamp;
}

const PaymentDetailsTimeline = ({ transaction }: PaymentDetailsTimelineProps) => {
    const createdAt = transaction.createdAt;
    const events = transaction.events;
    const timezone = transaction.balanceAccount?.timeZone;

    const defaultTimestamp = useMemo<TimelineTimestamp>(
        () => ({
            format: TimelineDateFormat.FULL_DATE_EXACT_TIME_WITHOUT_SECONDS,
            date: new Date(createdAt),
            timezone,
        }),
        [createdAt, timezone]
    );

    const eventKeys = useMemo(() => {
        const map = new WeakMap<NonNullable<typeof events>[number], string>();
        events?.forEach(event => map.set(event, uniqueId()));
        return map;
    }, [events]);

    return events ? (
        <Timeline showMore={{ limit: 2, placement: 'before-last' }}>
            {events.map(event => (
                <PaymentDetailsTimeline.Item key={eventKeys.get(event)} event={event} defaultTimestamp={defaultTimestamp} />
            ))}
        </Timeline>
    ) : null;
};

const renderTimelineListPropertyLabel: NonNullable<StructuredListProps['renderLabel']> = label => (
    <Typography el={TypographyElement.DIV} variant={TypographyVariant.CAPTION} className={TX_TIMELINE_LABEL}>
        {label}
    </Typography>
);

const renderTimelineListPropertyValue: NonNullable<StructuredListProps['renderValue']> = label => (
    <Typography el={TypographyElement.DIV} variant={TypographyVariant.CAPTION} className={TX_TIMELINE_VALUE}>
        {label}
    </Typography>
);

PaymentDetailsTimeline.Item = memo(({ defaultTimestamp, event }: PaymentDetailsTimelineItemProps) => {
    const { amount, createdAt, status, type } = event;
    const { i18n } = useCoreContext();

    const timestamp = useMemo<TimelineTimestamp>(() => ({ ...defaultTimestamp, date: new Date(createdAt) }), [defaultTimestamp, createdAt]);
    const formattedType = useMemo(() => getTransactionTimelineTxType(i18n, type)!, [i18n, type]);
    const items = useMemo<StructuredListItem[]>(() => {
        const { currency, value } = amount;
        const formattedAmount = `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
        const formattedStatus = getTransactionTimelineTxStatus(i18n, status)!;
        return [
            { key: 'transactions.details.timeline.fields.amount', value: formattedAmount },
            { key: 'transactions.details.timeline.fields.status', value: formattedStatus },
        ] as const;
    }, [i18n, amount, status]);

    // [TODO] - Remove this harcoded type once the team reviews all statuses and types and have less number of different strings, and more friendly ones.
    const fixedType = status.toLowerCase().includes('refund') ? 'Refund' : status.toLowerCase().includes('auth') ? 'Capture' : formattedType;

    return (
        <TimelineItem title={fixedType} timestamp={timestamp}>
            <StructuredList
                align="start"
                layout="3-9"
                items={items}
                renderLabel={renderTimelineListPropertyLabel}
                renderValue={renderTimelineListPropertyValue}
            />
        </TimelineItem>
    );
});

export default memo(PaymentDetailsTimeline);
