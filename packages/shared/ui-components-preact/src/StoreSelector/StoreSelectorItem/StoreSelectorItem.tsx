import Typography from '../../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../Typography/types';
import './StoreSelectorItem.scss';

interface StoreSelectorItemProps {
    name?: string;
    description?: string;
}

export const StoreSelectorItem = ({ name, description }: StoreSelectorItemProps) => (
    <div className="adyen-pe-store-selector-item">
        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className="adyen-pe-store-selector-item__name">
            {name}
        </Typography>
        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} className="adyen-pe-store-selector-item__description">
            {description}
        </Typography>
    </div>
);
