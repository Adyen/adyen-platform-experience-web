import { DATE_FORMAT_DISPUTES_TAG } from '../../../../../constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { getTranslation } from '../../../../../core/Localization/utils';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { TranslationKey } from '../../../../../translations';
import { IBalanceAccountBase } from '../../../../../types';
import { IDispute } from '../../../../../types/api/models/disputes';
import Icon from '../../../../internal/Icon';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';

const DATE_TRANSLATIONS = {
    'disputes.daysToRespond__plural': 'disputes.daysToRespond__plural',
    'disputes.daysToRespond': 'disputes.daysToRespond__singular',
};

const DisputeStatusTag = ({ item, activeBalanceAccount }: { item: IDispute; activeBalanceAccount?: IBalanceAccountBase }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(activeBalanceAccount?.timeZone);

    const value = item.status;

    if (value === 'won') {
        return <Tag variant={TagVariant.SUCCESS} label={i18n.get('disputes.won')} />;
    }
    if (value === 'lost') {
        return <Tag label={i18n.get('disputes.lost')} />;
    }

    if (value === 'action_needed' && item.dueDate) {
        const targetDate = new Date(item.dueDate);
        const now = Date.now();
        const diffMs = targetDate.getTime() - now;
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const isUrgent = days < 10;

        const formattedDueDate = dateFormat(item.dueDate, DATE_FORMAT_DISPUTES_TAG);

        return (
            <Tooltip
                content={
                    !isUrgent
                        ? formattedDueDate
                        : hours <= 24
                        ? i18n.get('disputes.respondToday', { values: { date: formattedDueDate } })
                        : i18n.get(getTranslation(DATE_TRANSLATIONS, 'disputes.daysToRespond', { count: days }) as TranslationKey, {
                              values: { date: formattedDueDate, days },
                          })
                }
            >
                <div>
                    <Tag variant={isUrgent ? TagVariant.ERROR : TagVariant.WARNING}>
                        <div className={'adyen-pe-disputes-table__tag-content'}>
                            {i18n.get('disputes.actionNeeded')}
                            {isUrgent ? <Icon name={'warning-filled'} /> : null}
                        </div>
                    </Tag>
                </div>
            </Tooltip>
        );
    }

    if (value === 'under_review' || value === 'docs_submitted') {
        return <Tag label={i18n.get('disputes.inProgress')} />;
    }
    return <Tag label={i18n.get('noData')} />;
};

export default DisputeStatusTag;
