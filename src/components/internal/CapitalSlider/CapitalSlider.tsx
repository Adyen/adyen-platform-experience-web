import './CapitalSlider.scss';
import Slider from '../Slider';
import { JSX } from 'preact';
import uniqueId from '../../../utils/random/uniqueId';
import Typography from '../Typography/Typography';
import { TypographyVariant } from '../Typography/types';
import { useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { IDynamicOfferConfig } from '../../../types';
import cx from 'classnames';

/**
 * Props for the CapitalSlider component.
 */
interface CapitalSliderProps {
    /**
     * The dynamic Capital offer
     */
    dynamicCapitalOffer: IDynamicOfferConfig;

    /**
     * Callback function that is called when the slider value changes.
     * @param value - The new value of the slider.
     */
    onValueChange?: (value: number) => void;

    /**
     * Called when the user releases the slider after changing its value.
     * @param value - The final value of the slider when released.
     */
    onRelease?: (value: number) => void;

    /**
     * Optional class name(s) for styling the Slider.
     */
    className?: string;
}

const CapitalSlider = ({ dynamicCapitalOffer, onValueChange, onRelease, className }: CapitalSliderProps) => {
    const id = uniqueId();
    const { i18n } = useCoreContext();
    const [sliderValue, setSliderValue] = useState<number>(dynamicCapitalOffer.minAmount.value);

    const handleValueChange = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const value = Number((event.target as HTMLInputElement).value);
        setSliderValue(value);
        onValueChange?.(value);
    };

    const handleRelease = (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        const value = Number((event.target as HTMLInputElement).value);
        onRelease?.(value);
    };

    return (
        <div className={cx('adyen-pe-capital-slider', className)}>
            <label htmlFor={id} className="adyen-pe-capital-slider__label">
                <Typography variant={TypographyVariant.BODY} stronger>
                    {i18n.get('capital.howMuchMoneyDoYouNeed')}
                </Typography>
            </label>
            <output htmlFor={id} className="adyen-pe-capital-slider__value" aria-live="polite">
                <span>{i18n.amount(sliderValue, dynamicCapitalOffer.minAmount.currency, { maximumFractionDigits: 0 })}</span>
            </output>
            <Slider
                id={id}
                value={sliderValue}
                min={dynamicCapitalOffer.minAmount.value}
                max={dynamicCapitalOffer.maxAmount.value}
                step={dynamicCapitalOffer.step}
                onChange={handleValueChange}
                onMouseUp={handleRelease}
                onTouchEnd={handleRelease}
                onKeyUp={handleRelease}
                className="adyen-pe-capital-slider__input"
            />
            <div className="adyen-pe-capital-slider__labels">
                <label>
                    <Typography variant={TypographyVariant.BODY}>{i18n.get('min')}</Typography>
                    <div>
                        {i18n.amount(dynamicCapitalOffer.minAmount.value, dynamicCapitalOffer.minAmount.currency, { maximumFractionDigits: 0 })}
                    </div>
                </label>
                <label>
                    <Typography variant={TypographyVariant.BODY}>{i18n.get('max')}</Typography>
                    <div>
                        {i18n.amount(dynamicCapitalOffer.maxAmount.value, dynamicCapitalOffer.maxAmount.currency, { maximumFractionDigits: 0 })}
                    </div>
                </label>
            </div>
        </div>
    );
};

export default CapitalSlider;
