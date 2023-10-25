import classNames from 'classnames';
import { StructuredListProps } from './types';
import './StructuredList.scss';
import { useStructuredListItems } from './useStructuredListItems';
import useCoreContext from '@src/core/Context/useCoreContext';
export const StructuredListLayouts = ['3-9', '6-6', '4-8', '8-4', '5-7', '7-5'] as const satisfies ReadonlyArray<`${number}-${number}`>;

const DEFAULT_LAYOUT_LABEL = '6';
const DEFAULT_LAYOUT_VALUE = '6';
export default function StructuredList({
    items,
    highlightable,
    renderValue,
    renderLabel,
    layout = `${DEFAULT_LAYOUT_LABEL}-${DEFAULT_LAYOUT_VALUE}`,
    grid = true,
}: StructuredListProps) {
    const splitLayout = layout.split('-');
    const labelWidth = splitLayout[0] ?? DEFAULT_LAYOUT_LABEL;
    const valueWidth = splitLayout[1] ?? DEFAULT_LAYOUT_VALUE;
    const formattedItems = useStructuredListItems(items);
    const { i18n } = useCoreContext();

    return (
        <div aria-label={i18n.get('structuredList')} className="adyen-fp-structured-list">
            {formattedItems.map(item => (
                <dl
                    key={item.id}
                    className={classNames('adyen-fp-structured-list__item adyen-fp-structured-list__item', {
                        'adyen-fp-structured-list__item--has-highlight': highlightable,
                        'adyen-fp-structured-list__grid': grid,
                    })}
                >
                    <dt className={classNames('adyen-fp-structured-list__label', `adyen-fp-structured-list__grid--width-${labelWidth}-of-12`)}>
                        {renderLabel ? renderLabel(item.label) : <div name="label">{item.label}</div>}
                    </dt>
                    <dd
                        aria-label={`value-${item.key}`}
                        className={classNames('adyen-fp-structured-list__content', `adyen-fp-structured-list__grid--width-${valueWidth}-of-12`)}
                    >
                        {renderValue ? renderValue(item.value) : <div>{item.value}</div>}
                    </dd>
                </dl>
            ))}
        </div>
    );
}
