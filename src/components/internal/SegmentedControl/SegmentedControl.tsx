import { SegmentedControlOption, SegmentedControlProps } from './types';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTabbedControl from '../../../hooks/useTabbedControl';
import Typography from '../Typography/Typography';
import './SegmentedControl.scss';

function SegmentedControl<T extends SegmentedControlOption[]>({ defaultOption, options }: SegmentedControlProps<T>) {
    const { activeIndex, setActiveIndex, onKeyDown, refs, uniqueId } = useTabbedControl(options, defaultOption);
    const { i18n } = useCoreContext();
    return (
        <div>
            <div role="radiogroup" className="adyen-fp-segmented-control">
                {options.map((option, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <button
                            role="radio"
                            name={option.id}
                            ref={refs[index]}
                            key={`option:${uniqueId}-${option.id}`}
                            id={`option:${uniqueId}-${option.id}`}
                            className="adyen-fp-segmented-control__item"
                            aria-checked={isActive}
                            aria-controls={`segment:${uniqueId}-${option.id}`}
                            onClick={isActive ? undefined : () => setActiveIndex(index)}
                            onKeyDown={onKeyDown}
                            disabled={option.disabled}
                            tabIndex={isActive ? 0 : -1}
                        >
                            <Typography
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                                className="adyen-fp-segmented-control__item-label"
                                stronger
                            >
                                {i18n.get(option.label)}
                            </Typography>
                        </button>
                    );
                })}
            </div>
            <div className="adyen-fp-segmented-content-container">
                {options.map((option, index) => (
                    <section
                        key={`segment:${uniqueId}-${option.id}`}
                        id={`segment:${uniqueId}-${option.id}`}
                        className="adyen-fp-segmented-content"
                        aria-labelledby={`option:${uniqueId}-${option.id}`}
                        hidden={activeIndex !== index}
                    >
                        {option.content}
                    </section>
                ))}
            </div>
        </div>
    );
}

export default SegmentedControl;
