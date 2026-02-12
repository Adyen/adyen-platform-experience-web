import './CapitalSlider.scss';
import Slider from '../Slider';
import { JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import uniqueId from '../../../utils/random/uniqueId';
import Typography from '../Typography/Typography';
import { TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import { IDynamicOffersConfig } from '../../../types';
import cx from 'classnames';

/**
 * Props for the CapitalSlider component.
 */
interface CapitalSliderProps {
    /**
     * The dynamic Capital offer
     */
    dynamicOffersConfig: IDynamicOffersConfig;

    /**
     * The current value of the CapitalSlider.
     * @default dynamicCapitalOffer.minAmount.value
     */
    value?: number;

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

const CapitalSlider = ({
    dynamicOffersConfig,
    value = dynamicOffersConfig.minAmount.value,
    onValueChange,
    onRelease,
    className,
}: CapitalSliderProps) => {
    const labelId = useMemo(() => uniqueId('elem'), []);
    const sliderId = useMemo(() => uniqueId('elem'), []);
    const { i18n } = useCoreContext();

    const dynamicOfferAmount = useMemo(
        () => i18n.amount(value, dynamicOffersConfig.minAmount.currency, { maximumFractionDigits: 0 }),
        [i18n, value, dynamicOffersConfig.minAmount.currency]
    );

    const handleValueChange = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const value = Number((event.target as HTMLInputElement).value);
        onValueChange?.(value);
    };

    const handleRelease = (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        const value = Number((event.target as HTMLInputElement).value);
        onRelease?.(value);
    };

    return (
        <div className={cx('adyen-pe-capital-slider', className)}>
            <label id={labelId} htmlFor={sliderId} className="adyen-pe-capital-slider__label" role="presentation">
                <Typography variant={TypographyVariant.BODY} stronger>
                    {i18n.get('capital.offer.selection.slider.a11y.label')}
                </Typography>
            </label>
            <div>
                <output aria-labelledby={labelId} htmlFor={sliderId} className="adyen-pe-capital-slider__value" aria-live="polite">
                    <Typography variant={TypographyVariant.TITLE} strongest>
                        {dynamicOfferAmount}
                    </Typography>
                </output>
                <Slider
                    id={sliderId}
                    value={value}
                    min={dynamicOffersConfig.minAmount.value}
                    max={dynamicOffersConfig.maxAmount.value}
                    step={dynamicOffersConfig.step}
                    onChange={handleValueChange}
                    onMouseUp={handleRelease}
                    onTouchEnd={handleRelease}
                    onKeyUp={handleRelease}
                    className="adyen-pe-capital-slider__input"
                    aria-valuetext={dynamicOfferAmount}
                />
            </div>
            <div className="adyen-pe-capital-slider__labels" aria-hidden="true">
                <div>
                    <Typography variant={TypographyVariant.CAPTION}>{i18n.get('capital.offer.selection.slider.markers.min')}</Typography>
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.amount(dynamicOffersConfig.minAmount.value, dynamicOffersConfig.minAmount.currency, { maximumFractionDigits: 0 })}
                    </Typography>
                </div>
                <div>
                    <Typography variant={TypographyVariant.CAPTION}>{i18n.get('capital.offer.selection.slider.markers.max')}</Typography>
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.amount(dynamicOffersConfig.maxAmount.value, dynamicOffersConfig.maxAmount.currency, { maximumFractionDigits: 0 })}
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default CapitalSlider;
