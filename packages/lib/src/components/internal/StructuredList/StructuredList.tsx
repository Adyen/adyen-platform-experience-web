import classNames from 'classnames';
import { StructuredListProps } from './types';
import './StructuredList.scss';
import { useStructuredListItems } from './useStructuredListItems';
export const StructuredListLayouts = ['3-9', '6-6', '4-8', '8-4', '5-7', '7-5'] as const satisfies ReadonlyArray<`${number}-${number}`>;

const DEFAULT_LAYOUT_LABEL = '6';
const DEFAULT_LAYOUT_VALUE = '6';
export const StructuredList = ({
    items,
    highlightable,
    renderValue,
    renderLabel,
    layout = `${DEFAULT_LAYOUT_LABEL}-${DEFAULT_LAYOUT_VALUE}`,
}: StructuredListProps) => {
    const splittedLayout = layout.split('-');
    const labelWidth = splittedLayout[0] ?? DEFAULT_LAYOUT_LABEL;
    const valueWidth = splittedLayout[1] ?? DEFAULT_LAYOUT_VALUE;
    const formattedItems = useStructuredListItems(items);
    return (
        <div className="structured-list">
            {formattedItems.map(item => (
                <div
                    v-for="item in itemsWithId"
                    key={item.id}
                    className={classNames('structured-list__item structured-list__grid structured-list__item', {
                        'structured-list__item--has-highlight': highlightable,
                    })}
                >
                    <div className={classNames('structured-list__label', `structured-list__grid--width-${labelWidth}-of-12`)}>
                        {renderLabel ? renderLabel(item.label) : <div name="label">{item.label}</div>}
                    </div>
                    <div className={classNames('structured-list__content', `structured-list__grid--width-${valueWidth}-of-12`)}>
                        {renderValue ? renderValue(item.value) : <div>{item.value}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
};
