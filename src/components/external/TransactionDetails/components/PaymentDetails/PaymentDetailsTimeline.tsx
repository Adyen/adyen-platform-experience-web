import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { uniqueId } from '../../../../../utils';
import { TransactionDetails } from '../../types';
import { TX_TIMELINE_LABEL, TX_TIMELINE_VALUE } from '../../constants';
import { getTransactionTimelineTxStatus, getTransactionTimelineTxType } from '../../../../utils/translation/getters';
import { StructuredListItem, StructuredListProps } from '../../../../internal/StructuredList/types';
import { TimelineDateFormat, TimelineTimestamp } from '../../../../internal/Timeline/types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TimelineItem } from '../../../../internal/Timeline/components/TimelineItem';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import StructuredList from '../../../../internal/StructuredList';
import Timeline from '../../../../internal/Timeline/Timeline';

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

    return (
        <TimelineItem title={formattedType} timestamp={timestamp}>
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
