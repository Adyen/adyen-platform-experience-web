import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import './CapitalHighlightedFields.scss';

type HighlightedField = {
    value: string;
    label?: string;
};

type CapitalHighlightedFieldsProps = {
    fields: HighlightedField[];
};

export const CapitalHighlightedFields = ({ fields }: CapitalHighlightedFieldsProps) => {
    return (
        <div className="adyen-pe-capital-highlighted-fields">
            {fields.map(({ label, value }, index) => (
                <div key={index} className="adyen-pe-capital-highlighted-fields__item">
                    {label && (
                        <Typography
                            el={TypographyElement.SPAN}
                            variant={TypographyVariant.CAPTION}
                            className="adyen-pe-capital-highlighted-fields__label"
                        >
                            {label}
                        </Typography>
                    )}
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {value}
                    </Typography>
                </div>
            ))}
        </div>
    );
};
