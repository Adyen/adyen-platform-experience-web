import { ComponentChildren } from 'preact';
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import cx from 'classnames';
import { TimelineContext } from '../context';
import { DateUnit, TimelineDataList, TimelineEntry, TimelineStatus, TimelineTagProps, TimelineTimestamp } from '../types';
import { DateText, formatDistanceStrict } from './DateText';
import Button from '../../Button';
import { ButtonVariant } from '../../Button/types';
import Typography from '../../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../Typography/types';
import { Tag } from '../../Tag/Tag';
import StructuredList from '../../StructuredList/StructuredList';
import Icon from '../../Icon';
import './TimelineItem.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../translations';
import useUniqueId from '../../../../hooks/useUniqueId';

const UNIT_TRANSLATION_KEYS: Record<DateUnit, TranslationKey> = {
    day: 'common.timeline.timelineItem.timeGap.unit.day',
};

export interface TimelineItemProps {
    dataList?: TimelineDataList | null;
    description?: string | null;
    status?: TimelineStatus;
    tag?: TimelineTagProps;
    timestamp: TimelineTimestamp;
    title?: string | null;
    children?: ComponentChildren;
}

export function TimelineItem({ dataList = null, description = null, status = 'black', tag, timestamp, title = null, children }: TimelineItemProps) {
    const { i18n } = useCoreContext();
    const context = useContext(TimelineContext);

    if (!context) {
        throw new Error('TimelineItem must be used within a Timeline component');
    }

    const { registerTimelineEntry, entries, showAll, showMoreIndex, hiddenItems, visibleIndexes, timeGapLimit, toggleShowAll } = context;

    const instanceIdRef = useRef<string>(useUniqueId());

    // Register this timeline entry on mount, unregister on unmount
    useLayoutEffect(() => {
        const entry = {
            title: title || undefined,
            description: description || undefined,
            date: timestamp.date,
            _instanceId: instanceIdRef.current,
        };
        const unregister = registerTimelineEntry(entry as any);
        return unregister;
    }, [registerTimelineEntry, title, description, timestamp.date]);

    // Calculate index by finding this entry using the instance ID
    const index = useMemo(() => {
        const foundIndex = entries.findIndex(entry => (entry as any)._instanceId === instanceIdRef.current);
        return foundIndex;
    }, [entries]);

    const allItemsShowing = showAll || !visibleIndexes;
    // If index is -1, component is registering - use allItemsShowing to determine visibility
    const isVisible = index === -1 ? allItemsShowing : allItemsShowing ? true : visibleIndexes.includes(index);

    const timeGap = useMemo(() => {
        if (!timeGapLimit || index <= 0) {
            return null;
        }
        const previousEntry = entries[index - 1];
        if (!previousEntry) {
            return null;
        }
        const isPreviousItemVisible = allItemsShowing || (visibleIndexes && visibleIndexes.includes(index - 1));
        if (!isPreviousItemVisible) {
            return null;
        }
        const currentDate = timestamp.date;
        const previousDate = previousEntry.date;

        const timegapInSelectedUnit = formatDistanceStrict(previousDate, currentDate, { unit: timeGapLimit.unit || 'day' });

        const formattedTimeGap = i18n.get(UNIT_TRANSLATION_KEYS[timegapInSelectedUnit.unit], {
            values: { value: timegapInSelectedUnit.value },
            count: timegapInSelectedUnit.value,
        });

        return timeGapLimit.thresholdAmount < timegapInSelectedUnit.value ? formattedTimeGap : null;
    }, [timeGapLimit, entries, index, allItemsShowing, visibleIndexes, timestamp.date, i18n]);

    const timeGapAriaLabel = timeGap ? i18n.get('common.timeline.timelineItem.timeGap.a11y.label', { values: { timeGap } }) : '';

    const displayShowMoreButton = hiddenItems && showMoreIndex === index;

    const isLastItem = index === entries.length - 1;

    const iconConditionalClasses = cx('adyen-pe-timeline-item__icon', {
        [`adyen-pe-timeline-item__icon--${status}`]: status,
    });

    if (!isVisible) {
        return null;
    }

    return (
        <li className={'adyen-pe-timeline-item'}>
            {timeGap && (
                <div className="adyen-pe-timeline-item__row">
                    <div className="adyen-pe-timeline-item__marker" aria-hidden="true">
                        <div className="adyen-pe-timeline-item__icon adyen-pe-timeline-item__icon--timegap"></div>
                        <div className="adyen-pe-timeline-item__separator"></div>
                    </div>
                    <div className="adyen-pe-timeline-item__content">
                        <Typography className="adyen-pe-timeline-item__timegap" variant={TypographyVariant.CAPTION} aria-label={timeGapAriaLabel}>
                            {timeGap}
                        </Typography>
                    </div>
                </div>
            )}
            <div className="adyen-pe-timeline-item__row">
                <div className="adyen-pe-timeline-item__marker" aria-hidden="true">
                    <Icon name="square-small-fill" className={iconConditionalClasses} />
                    {!isLastItem && <div className="adyen-pe-timeline-item__separator" data-testid="last-timeline-item-separator"></div>}
                </div>
                <div className="adyen-pe-timeline-item__content">
                    {title && (
                        <div role="heading" aria-level={2}>
                            <Typography
                                el={TypographyElement.DIV}
                                variant={TypographyVariant.BODY}
                                strongest
                                className="adyen-pe-timeline-item__title"
                            >
                                <span>{title}</span>
                            </Typography>
                        </div>
                    )}

                    {timestamp && (
                        <Typography className="adyen-pe-timeline-item__timestamp" el={TypographyElement.DIV} variant={TypographyVariant.CAPTION}>
                            <DateText date={timestamp.date} format={timestamp.format} />
                            {timestamp.value && ` ${timestamp.value}`}
                        </Typography>
                    )}

                    {(description || children) && (
                        <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} className="adyen-pe-timeline-item__description">
                            {children || description}
                        </Typography>
                    )}

                    {dataList && (
                        <div className="adyen-pe-timeline-item__data-list">
                            <StructuredList
                                condensed
                                align="start"
                                items={dataList.map(entry => ({
                                    label: entry.label,
                                    value: entry.value,
                                    key: entry.key,
                                    id: entry.key,
                                }))}
                            />
                        </div>
                    )}
                    {tag && (
                        <div className="adyen-pe-timeline-item__tag">
                            <Tag {...tag} />
                        </div>
                    )}
                </div>
            </div>
            {displayShowMoreButton && (
                <div className="adyen-pe-timeline-item__row">
                    <div className="adyen-pe-timeline-item__marker" aria-hidden="true">
                        <div className="adyen-pe-timeline-item__separator"></div>
                    </div>
                    <div className="adyen-pe-timeline-item__content">
                        <Button className="adyen-pe-timeline__show-more" variant={ButtonVariant.TERTIARY} onClick={toggleShowAll}>
                            {!showAll
                                ? i18n.get('common.timeline.timelineItem.showMoreItems', { values: { items: hiddenItems } })
                                : i18n.get('common.timeline.timelineItem.showLess')}
                        </Button>
                    </div>
                </div>
            )}
        </li>
    );
}
