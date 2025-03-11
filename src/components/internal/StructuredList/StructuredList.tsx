import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../translations';
import { TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import {
    SL_ALIGN_END,
    SL_BASE_CLASS,
    SL_CONTENT_CLASS,
    SL_GRID_CLASS,
    SL_ITEM_CLASS,
    SL_ITEM_WITH_HIGHLIGHT_CLASS,
    SL_LABEL_CLASS,
} from './constants';
import { StructuredListProps } from './types';
import './StructuredList.scss';
import { useStructuredListItems } from './useStructuredListItem';

export const StructuredListLayouts = ['3-9', '4-8', '5-7', '6-6', '7-5', '8-4'] as const satisfies ReadonlyArray<`${number}-${number}`>;

const DEFAULT_LAYOUT = '6-6';
export default function StructuredList({
    items,
    highlightable,
    renderValue,
    renderLabel,
    layout = DEFAULT_LAYOUT,
    grid = true,
    classNames,
    align = 'end',
}: StructuredListProps) {
    const [LABEL_COL_CLASS, VALUE_COL_CLASS] = useMemo(() => {
        return layout.split('-').map(w => `${SL_GRID_CLASS}--width-${w}-of-12`);
    }, [layout]);
    const formattedItems = useStructuredListItems(items);
    const { i18n } = useCoreContext();

    return (
        <dl aria-label={i18n.get('structuredList')} className={cx(SL_BASE_CLASS, classNames, { [SL_ALIGN_END]: align === 'end' })}>
            {formattedItems.map((item, index) => (
                <div
                    key={`${index}_${item.id || '0'}`}
                    className={cx(SL_ITEM_CLASS, {
                        [SL_ITEM_WITH_HIGHLIGHT_CLASS]: highlightable,
                        [SL_GRID_CLASS]: grid,
                    })}
                >
                    <dt className={cx(SL_LABEL_CLASS, LABEL_COL_CLASS)}>
                        {renderLabel ? (
                            renderLabel(item.label, items[index]!.key)
                        ) : (
                            <Typography variant={TypographyVariant.BODY}>{item.label}</Typography>
                        )}
                    </dt>
                    <dd aria-label={`${i18n.get(item.key as TranslationKey)} ${i18n.get('value')}`} className={cx(SL_CONTENT_CLASS, VALUE_COL_CLASS)}>
                        {renderValue ? (
                            renderValue(item.value, item.key, item.type, item.details)
                        ) : (
                            <Typography variant={TypographyVariant.BODY}>{item.value}</Typography>
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
