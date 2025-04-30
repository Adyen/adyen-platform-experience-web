import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IDispute, IDisputeListItem } from '../../../../../types/api/models/disputes';
import Icon from '../../../../internal/Icon';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { PropsWithChildren } from 'preact/compat';
import cx from 'classnames';
import { TranslationKey } from '../../../../../translations';

const STATUS_LABELS = {
    UNDEFENDED: 'disputes.undefended',
    UNRESPONDED: 'disputes.unresponded',
    EXPIRED: 'disputes.expired',
    ACCEPTED: 'disputes.accepted',
    PENDING: 'disputes.pending',
    RESPONDED: 'disputes.responded',
    LOST: 'disputes.lost',
    WON: 'disputes.won',
} satisfies { [k in IDisputeListItem['status']]: TranslationKey };

const DisputeStatusDisplay = ({
    dispute,
    type = 'tag',
    children,
}: PropsWithChildren<{
    dispute: IDisputeListItem | IDispute;
    type?: 'text' | 'tag';
}>) => {
    const { i18n } = useCoreContext();

    const value = dispute.status;

    if (value === 'WON') {
        return <Tag variant={TagVariant.SUCCESS} label={i18n.get('disputes.won')} />;
    }
    if (value === 'LOST') {
        return <Tag label={i18n.get('disputes.lost')} />;
    }

    if ((value === 'UNDEFENDED' || value === 'UNRESPONDED') && dispute.dueDate) {
        const targetDate = new Date(dispute.dueDate);
        const now = Date.now();
        const diffMs = targetDate.getTime() - now;
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const isUrgent = days < 10;

        const StatusLabel = () => {
            return (
                <div
                    className={cx('adyen-pe-disputes-table__status-content', {
                        ['adyen-pe-disputes-table__status-content--urgent']: isUrgent,
                    })}
                >
                    {isUrgent && type === 'text' ? <Icon name={'warning-filled'} /> : null}
                    {children || i18n.get(STATUS_LABELS[value])}
                </div>
            );
        };

        return (
            <div>
                {type === 'tag' ? (
                    <Tag variant={isUrgent ? TagVariant.ERROR : TagVariant.DEFAULT}>
                        <StatusLabel />
                    </Tag>
                ) : (
                    <StatusLabel />
                )}
            </div>
        );
    }

    return <Tag label={i18n.get(STATUS_LABELS[value])} />;
};

export default DisputeStatusDisplay;
