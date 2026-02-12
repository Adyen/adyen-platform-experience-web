import { SegmentedControlProps } from './types';
import { AriaAttributes } from 'preact/compat';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTabbedControl from '../../../hooks/useTabbedControl';
import Typography from '../Typography/Typography';
import './SegmentedControl.scss';

function SegmentedControl<ItemId extends string>({
    ['aria-label']: ariaLabel,
    activeItem,
    items,
    onChange,
}: SegmentedControlProps<ItemId> & Pick<AriaAttributes, 'aria-label'>) {
    const { activeIndex, onClick, onKeyDown, refs, uniqueId } = useTabbedControl({ onChange, options: items, activeOption: activeItem });
    const { i18n } = useCoreContext();
    return (
        <div>
            <div role="radiogroup" className="adyen-pe-segmented-control" aria-label={ariaLabel}>
                {items.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <button
                            role="radio"
                            name={item.id}
                            ref={refs[index]}
                            key={`item:${uniqueId}-${item.id}`}
                            id={`item:${uniqueId}-${item.id}`}
                            className="adyen-pe-segmented-control__item"
                            aria-checked={isActive}
                            aria-controls={`segment:${uniqueId}-${item.id}`}
                            onClick={isActive ? undefined : onClick}
                            onKeyDown={onKeyDown}
                            disabled={item.disabled}
                            tabIndex={isActive ? 0 : -1}
                        >
                            <Typography
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                                className="adyen-pe-segmented-control__item-label"
                                stronger
                            >
                                {i18n.get(item.label)}
                            </Typography>
                        </button>
                    );
                })}
            </div>
            <div className="adyen-pe-segmented-content-container">
                {items.map((item, index) => (
                    <div
                        key={`segment:${uniqueId}-${item.id}`}
                        id={`segment:${uniqueId}-${item.id}`}
                        className="adyen-pe-segmented-content"
                        aria-labelledby={`item:${uniqueId}-${item.id}`}
                        hidden={activeIndex !== index}
                    >
                        {item.content}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SegmentedControl;
