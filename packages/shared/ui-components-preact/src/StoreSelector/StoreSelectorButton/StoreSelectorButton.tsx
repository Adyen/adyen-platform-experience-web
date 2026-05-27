import Typography from '../../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../Typography/types';
import Icon from '../../Icon';
import './StoreSelectorButton.scss';

interface StoreSelectorButtonContentProps {
    name?: string;
    description?: string;
}

export const StoreSelectorButtonContent = ({ name, description }: StoreSelectorButtonContentProps) => (
    <div className="adyen-pe-store-selector-button">
        <div className="adyen-pe-store-selector-button__labels">
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className="adyen-pe-store-selector-button__name">
                {name}
            </Typography>
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} className="adyen-pe-store-selector-button__description">
                {description}
            </Typography>
        </div>

        <Icon name="chevron-up-down" size="medium" className="adyen-pe-store-selector-button__icon" />
    </div>
);
