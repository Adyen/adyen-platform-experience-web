import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import './CapitalHighlightedFields.scss';
import cx from 'classnames';

type HighlightedField = {
    value: string;
    label?: string;
};

type CapitalHighlightedFieldsProps = {
    fields: HighlightedField[];
    align?: 'left' | 'center';
};

export const CapitalHighlightedFields = ({ fields, align }: CapitalHighlightedFieldsProps) => {
    return (
        <div
            className={cx('adyen-pe-capital-highlighted-fields', {
                'adyen-pe-capital-highlighted-fields--center': align === 'center',
            })}
        >
            {fields.map(({ label, value }) => (
                <div
                    key={label}
                    className={cx('adyen-pe-capital-highlighted-fields__item', {
                        'adyen-pe-capital-highlighted-fields__item--center': align === 'center',
                    })}
                >
                    {label && (
                        <Typography
                            el={TypographyElement.SPAN}
                            variant={TypographyVariant.CAPTION}
                            className={cx('adyen-pe-capital-highlighted-fields__label', {
                                'adyen-pe-capital-highlighted-fields__label--center': align === 'center',
                            })}
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
