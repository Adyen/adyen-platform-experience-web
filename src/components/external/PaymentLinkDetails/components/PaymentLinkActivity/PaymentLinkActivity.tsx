import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TimelineItem } from '../../../../internal/Timeline/components/TimelineItem';
import Timeline from '../../../../internal/Timeline/Timeline';
import { TimelineDateFormat } from '../../../../internal/Timeline/types';
import { IPaymentLinkActivity } from '../../../../../types';
import { getTitleKey, getDescriptionKey, getStatus } from './utils';

type PaymentLinkActivityProps = {
    activities: IPaymentLinkActivity[];
};

export const PaymentLinkActivity = ({ activities }: PaymentLinkActivityProps) => {
    const { i18n } = useCoreContext();

    const timelineItems = useMemo(
        () =>
            activities.map(activity => ({
                titleKey: getTitleKey(activity),
                descriptionKey: getDescriptionKey(activity),
                date: activity.date,
                status: getStatus(activity),
            })),
        [activities]
    );

    return (
        <Timeline>
            {timelineItems.map(({ titleKey, date, status, descriptionKey }: any) => (
                <TimelineItem
                    key={date}
                    title={i18n.get(titleKey)}
                    timestamp={{
                        date: new Date(date),
                        format: TimelineDateFormat.FULL_DATE_EXACT_TIME,
                    }}
                    status={status}
                    description={i18n.get(descriptionKey)}
                />
            ))}
        </Timeline>
    );
};
